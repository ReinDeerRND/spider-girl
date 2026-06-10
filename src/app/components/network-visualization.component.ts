import {
  Component,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
// @ts-ignore
import * as d3 from 'd3';
import { Item, Link } from '../models/spider.model';

interface NetworkNode extends Item {
  x?: number;
  y?: number;
  radius?: number;
}

interface NetworkLink extends Link {
  source: string | NetworkNode;
  target: string | NetworkNode;
}

interface NetworkNode extends Item {
  x?: number;
  y?: number;
  radius?: number;
}

interface NetworkLink extends Link {
  source: string | NetworkNode;
  target: string | NetworkNode;
}

@Component({
  selector: 'app-network-visualization',
  template: `
    <div class="network-container">
      <div class="controls">
        <label>Выберите центральный элемент: </label>
        <select (change)="onSelectCenter($event)">
          <option [value]="''">-- Выберите узел --</option>
          <option
            *ngFor="let item of allItems"
            [value]="item.id"
            [selected]="item.id === selectedItemId"
          >
            {{ item.title }} ({{ item.type }})
          </option>
        </select>
        <button (click)="resetView()" class="reset-btn">Сбросить вид</button>
      </div>
      <div #networkContainer class="network-svg-container"></div>
      <div
        *ngIf="hoveredNode"
        class="tooltip"
        [style.left.px]="tooltipX"
        [style.top.px]="tooltipY"
      >
        <strong>{{ hoveredNode.title }}</strong
        ><br />
        Тип: {{ hoveredNode.type }}<br />
        ID: {{ hoveredNode.id }}
      </div>
    </div>
  `,
  styles: [
    `
      .network-container {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 600px;
        background: #f5f5f5;
        border-radius: 8px;
        overflow: hidden;
      }
      .controls {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 10;
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        gap: 10px;
        align-items: center;
      }
      select {
        padding: 5px 10px;
        border-radius: 4px;
        border: 1px solid #ccc;
        cursor: pointer;
      }
      .reset-btn {
        padding: 5px 10px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      .reset-btn:hover {
        background: #0056b3;
      }
      .network-svg-container {
        width: 100%;
        height: 100%;
        min-height: 600px;
      }
      .tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        pointer-events: none;
        z-index: 100;
        white-space: nowrap;
      }
    `,
  ],
})
export class NetworkVisualizationComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() items: Item[] = [];
  @Input() links: Link[] = [];
  @Input() selectedItemId?: string;

  @ViewChild('networkContainer', { static: true })
  private containerRef!: ElementRef;

  svg: any;
  private svgGroup: any;
  private width = 800;
  private height = 600;
  allItems: Item[] = [];
  hoveredNode: NetworkNode | null = null;
  tooltipX = 0;
  tooltipY = 0;

  ngOnInit(): void {
    this.allItems = [...this.items];
    if (!this.selectedItemId && this.items.length > 0) {
      this.selectedItemId = this.items[0].id;
    }
  }

  ngAfterViewInit(): void {
    this.createVisualization();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] || changes['links']) {
      this.allItems = [...this.items];
      if (this.svgGroup) {
        this.updateVisualization();
      }
    }
    if (
      changes['selectedItemId'] &&
      !changes['selectedItemId']?.firstChange &&
      this.svgGroup
    ) {
      this.updateVisualization();
    }
  }

  onSelectCenter(event: any): void {
    this.selectedItemId = event.target.value;
    this.updateVisualization();
  }

  resetView(): void {
    if (this.svgGroup) {
      this.svgGroup
        .transition()
        .duration(750)
        .attr('transform', 'translate(0,0) scale(1)');
    }
  }

  private createVisualization(): void {
    const element = this.containerRef.nativeElement;
    this.width = element.clientWidth;
    this.height = element.clientHeight;

    // Удаляем предыдущее содержимое
    d3.select(element).selectAll('*').remove();

    // Создаем SVG
    const svgElement = d3
      .select(element)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    // Добавляем возможность zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        if (this.svgGroup) {
          this.svgGroup.attr('transform', event.transform.toString());
        }
      });

    svgElement.call(zoom);

    // Создаем группу для контента
    this.svgGroup = svgElement
      .append('g')
      .attr('transform', `translate(${this.width / 2},${this.height / 2})`);

    this.updateVisualization();
  }

  private updateVisualization(): void {
    if (!this.svgGroup || !this.items.length) return;

    // Очищаем предыдущие элементы
    this.svgGroup.selectAll('*').remove();

    // Подготавливаем данные для сети
    const selectedNode = this.items.find(
      (item) => item.id === this.selectedItemId,
    );
    if (!selectedNode) return;

    // Формируем граф
    const nodes: NetworkNode[] = [...this.items];
    const linksData: NetworkLink[] = this.links
      .filter((link) => {
        // Показываем только связи, где участвует выбранный узел
        return link.records.includes(selectedNode.id);
      })
      .map((link) => {
        const [sourceId, targetId] = link.records;
        return {
          ...link,
          source: sourceId,
          target: targetId,
        };
      });

    // Определяем уникальные узлы для отображения (центральный + связанные)
    const connectedNodeIds = new Set<string>();
    connectedNodeIds.add(selectedNode.id);
    linksData.forEach((link) => {
      if (typeof link.source === 'string') connectedNodeIds.add(link.source);
      if (typeof link.target === 'string') connectedNodeIds.add(link.target);
    });

    const displayNodes = nodes.filter((node) => connectedNodeIds.has(node.id));

    // Позиционируем узлы по кругу
    const radius = Math.min(this.width, this.height) * 0.35;
    const angleStep = (Math.PI * 2) / (displayNodes.length - 1);

    let angle = 0;
    displayNodes.forEach((node) => {
      if (node.id === selectedNode.id) {
        node.x = 0;
        node.y = 0;
      } else {
        node.x = Math.cos(angle) * radius;
        node.y = Math.sin(angle) * radius;
        angle += angleStep;
      }
      node.radius = node.id === selectedNode.id ? 30 : 20;
    });

    // Создаем defs для маркеров и фильтров
    const defs = this.svgGroup.append('defs');

    // Добавляем маркеры для стрелок
    defs
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 25)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#999');

    // Добавляем эффект свечения для центрального узла
    const filter = defs
      .append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '5')
      .attr('result', 'coloredBlur');

    filter
      .append('feMerge')
      .selectAll('feMergeNode')
      .data(['coloredBlur', 'SourceGraphic'])
      .enter()
      .append('feMergeNode')
      .attr('in', (d: string) => d);

    // Создаем линии (связи)
    this.svgGroup
      .selectAll('line')
      .data(linksData)
      .enter()
      .append('line')
      .attr('x1', (d: NetworkLink) => {
        const sourceNode = displayNodes.find((n) => n.id === d.records[0]);
        return sourceNode?.x || 0;
      })
      .attr('y1', (d: NetworkLink) => {
        const sourceNode = displayNodes.find((n) => n.id === d.records[0]);
        return sourceNode?.y || 0;
      })
      .attr('x2', (d: NetworkLink) => {
        const targetNode = displayNodes.find((n) => n.id === d.records[1]);
        return targetNode?.x || 0;
      })
      .attr('y2', (d: NetworkLink) => {
        const targetNode = displayNodes.find((n) => n.id === d.records[1]);
        return targetNode?.y || 0;
      })
      .attr('stroke', (d: NetworkLink) => this.getLinkColor(d.type))
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d: NetworkLink) =>
        d.type.includes('yellow') ? '5,5' : 'none',
      )
      .attr('opacity', 0.7);

    // Создаем группы для узлов
    const nodeGroups = this.svgGroup
      .selectAll('.node')
      .data(displayNodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: NetworkNode) => `translate(${d.x},${d.y})`)
      .on('mouseenter', (event: MouseEvent, d: NetworkNode) => {
        this.showTooltip(event, d);
      })
      .on('mouseleave', () => {
        this.hideTooltip();
      })
      .on('click', (event: MouseEvent, d: NetworkNode) => {
        event.stopPropagation();
        if (d.id !== selectedNode.id) {
          this.selectedItemId = d.id;
          this.updateVisualization();
        }
      });

    // Рисуем круги узлов
    nodeGroups
      .append('circle')
      .attr('r', (d: NetworkNode) => d.radius || 20)
      .attr('fill', (d: NetworkNode) => this.getNodeColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('cursor', 'pointer')
      .attr('opacity', 0.9)
      .attr('filter', (d: NetworkNode) =>
        d.id === selectedNode.id ? 'url(#glow)' : 'none',
      );

    // Добавляем текст на узлы
    nodeGroups
      .append('text')
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text((d: NetworkNode) => d.title);

    // Добавляем анимацию появления
    nodeGroups.attr('opacity', 0).transition().duration(500).attr('opacity', 1);

    this.svgGroup
      .selectAll('line')
      .attr('opacity', 0)
      .transition()
      .duration(500)
      .attr('opacity', 0.7);
  }

  private getNodeColor(type: any): string {
    switch (type) {
      case 'red':
        return '#e74c3c';
      case 'green':
        return '#2ecc71';
      case 'blue':
        return '#3498db';
      case 'yellow':
        return '#f1c40f';
      default:
        return '#95a5a6';
    }
  }

  private getLinkColor(linkType: string): string {
    switch (linkType) {
      case 'red_green':
        return '#27ae60';
      case 'red_blue':
        return '#2980b9';
      case 'red_yellow':
        return '#f39c12';
      default:
        return '#7f8c8d';
    }
  }

  private showTooltip(event: MouseEvent, node: NetworkNode): void {
    this.hoveredNode = node;
    this.tooltipX = event.pageX + 10;
    this.tooltipY = event.pageY - 30;
  }

  private hideTooltip(): void {
    this.hoveredNode = null;
  }
}
