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
  depth?: number; // Добавляем глубину узла
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
        <div class="control-group">
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
        </div>

        <div class="control-group">
          <label>Глубина отображения: </label>
          <div class="depth-switch">
            <button 
              [class.active]="depthLevel === 1" 
              (click)="setDepthLevel(1)"
              class="depth-btn">
              Только 1-й уровень
            </button>
            <button 
              [class.active]="depthLevel === 2" 
              (click)="setDepthLevel(2)"
              class="depth-btn">
              1-й и 2-й уровни
            </button>
          </div>
        </div>

        <button (click)="resetView()" class="reset-btn">Сбросить вид</button>
      </div>
      <div #networkContainer class="network-svg-container"></div>
      <div
        *ngIf="hoveredNode"
        class="tooltip"
        [style.left.px]="tooltipX"
        [style.top.px]="tooltipY"
      >
        <strong>{{ hoveredNode.title }}</strong><br />
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
        flex-wrap: wrap;
      }
      .control-group {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .depth-switch {
        display: flex;
        gap: 5px;
        background: #f0f0f0;
        border-radius: 5px;
        padding: 2px;
      }
      .depth-btn {
        padding: 5px 10px;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        background: transparent;
        transition: all 0.3s;
      }
      .depth-btn.active {
        background: #007bff;
        color: white;
      }
      .depth-btn:hover:not(.active) {
        background: #e0e0e0;
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
  depthLevel: number = 1; // 1 или 2

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

  setDepthLevel(level: number): void {
    this.depthLevel = level;
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

  private calculateNodeDepths(startNodeId: string): Map<string, number> {
    const depths = new Map<string, number>();
    const queue: { id: string; depth: number }[] = [{ id: startNodeId, depth: 0 }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      
      if (visited.has(id)) continue;
      visited.add(id);
      depths.set(id, depth);

      // Находим все связи для текущего узла
      const connectedLinks = this.links.filter(
        link => link.records.includes(id)
      );

      for (const link of connectedLinks) {
        const neighborId = link.records[0] === id ? link.records[1] : link.records[0];
        if (!visited.has(neighborId) && depth + 1 <= this.depthLevel) {
          queue.push({ id: neighborId, depth: depth + 1 });
        }
      }
    }

    return depths;
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

    // Вычисляем глубину для каждого узла
    const nodeDepths = this.calculateNodeDepths(selectedNode.id);
    
    // Формируем граф с учетом глубины
    const nodes: NetworkNode[] = [...this.items];
    
    // Определяем узлы для отображения на основе глубины
    const displayNodeIds = new Set<string>();
    nodeDepths.forEach((depth, nodeId) => {
      if (depth <= this.depthLevel) {
        displayNodeIds.add(nodeId);
      }
    });

    // Фильтруем связи - показываем только связи между отображаемыми узлами
    const linksData: NetworkLink[] = this.links
      .filter((link) => {
        const [sourceId, targetId] = link.records;
        return displayNodeIds.has(sourceId) && displayNodeIds.has(targetId);
      })
      .map((link) => {
        const [sourceId, targetId] = link.records;
        return {
          ...link,
          source: sourceId,
          target: targetId,
        };
      });

    const displayNodes = nodes.filter((node) => displayNodeIds.has(node.id));
    
    // Добавляем информацию о глубине к узлам
    displayNodes.forEach(node => {
      node.depth = nodeDepths.get(node.id) || 0;
    });

    // Позиционируем узлы по кругу с учетом глубины
    const radiusStep = Math.min(this.width, this.height) * 0.2;
    const firstLevelNodes = displayNodes.filter(n => n.depth === 1);
    const secondLevelNodes = displayNodes.filter(n => n.depth === 2);
    
    // Позиционируем узлы первого уровня
    const angleStep1 = (Math.PI * 2) / (firstLevelNodes.length || 1);
    let angle = 0;
    
    displayNodes.forEach((node) => {
      if (node.id === selectedNode.id) {
        node.x = 0;
        node.y = 0;
        node.radius = 35;
      } else if (node.depth === 1) {
        const radius = radiusStep;
        node.x = Math.cos(angle) * radius;
        node.y = Math.sin(angle) * radius;
        node.radius = 25;
        angle += angleStep1;
      } else if (node.depth === 2 && this.depthLevel === 2) {
        // Находим родительский узел для позиционирования
        const parentLink = this.links.find(link => 
          link.records.includes(node.id) && 
          displayNodeIds.has(link.records[0]) && 
          displayNodeIds.has(link.records[1])
        );
        
        if (parentLink) {
          const parentId = parentLink.records[0] === node.id ? parentLink.records[1] : parentLink.records[0];
          const parentNode = displayNodes.find(n => n.id === parentId);
          
          if (parentNode && parentNode.x && parentNode.y) {
            const angleToParent = Math.atan2(parentNode.y, parentNode.x);
            const radius = radiusStep * 1.8;
            node.x = Math.cos(angleToParent + Math.PI / 4) * radius;
            node.y = Math.sin(angleToParent + Math.PI / 4) * radius;
          } else {
            // Fallback позиционирование
            const radius = radiusStep * 1.8;
            node.x = Math.cos(angle) * radius;
            node.y = Math.sin(angle) * radius;
          }
        } else {
          const radius = radiusStep * 1.8;
          node.x = Math.cos(angle) * radius;
          node.y = Math.sin(angle) * radius;
        }
        node.radius = 20;
        angle += 0.3;
      }
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

    // Рисуем круги узлов с разными размерами в зависимости от глубины
    nodeGroups
      .append('circle')
      .attr('r', (d: NetworkNode) => d.radius || 20)
      .attr('fill', (d: NetworkNode) => this.getNodeColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', (d: NetworkNode) => d.depth === 0 ? 4 : 2)
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
      .attr('font-size', (d: NetworkNode) => d.depth === 0 ? '14px' : '11px')
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