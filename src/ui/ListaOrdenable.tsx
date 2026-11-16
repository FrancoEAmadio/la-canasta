import type { CSSProperties, ReactNode } from 'react';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from '@dnd-kit/core';
import { SortableContext, rectSwappingStrategy, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { vibrar } from '../infra/vibracion';

/** Solo se mueve para arriba y para abajo. */
const soloVertical: Modifier = ({ transform }) => ({ ...transform, x: 0 });

interface PropsLista {
  ids: string[];
  /** Se llama al soltar una tarjeta en otro lugar: índice de origen y de destino. */
  onMover: (desde: number, hasta: number) => void;
  /** En vez de correr la lista, el elemento soltado intercambia su lugar con el otro (casilleros sueltos en varios grupos). */
  intercambio?: boolean;
  children: ReactNode;
}

/** Lista que se reordena manteniendo apretado un elemento y arrastrándolo (el scroll normal sigue andando). */
export function ListaOrdenable({ ids, onMover, intercambio = false, children }: PropsLista) {
  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const alSoltar = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const desde = ids.indexOf(String(active.id));
    const hasta = ids.indexOf(String(over.id));
    if (desde >= 0 && hasta >= 0) onMover(desde, hasta);
  };

  return (
    <DndContext
      sensors={sensores}
      collisionDetection={closestCenter}
      modifiers={intercambio ? undefined : [soloVertical]}
      onDragStart={() => vibrar()}
      onDragEnd={alSoltar}
    >
      <SortableContext items={ids} strategy={intercambio ? rectSwappingStrategy : verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

interface PropsItem {
  id: string;
  className?: string;
  /** Etiqueta HTML del elemento (por defecto, elemento de lista). */
  etiqueta?: 'li' | 'div';
  /** Si es true, no se puede levantar (pero sí soltar otro encima). */
  fijo?: boolean;
  style?: CSSProperties;
  children: ReactNode;
}

/** Elemento de la lista: al levantarlo se agranda y proyecta sombra. */
export function ItemOrdenable({ id, className = '', etiqueta: Etiqueta = 'li', fijo = false, style, children }: PropsItem) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: fijo ? { draggable: true } : undefined });
  const estilo: CSSProperties = {
    ...style,
    transform: CSS.Transform.toString(transform ? { ...transform, scaleX: isDragging ? 1.04 : 1, scaleY: isDragging ? 1.04 : 1 } : null),
    transition,
    touchAction: 'manipulation',
    position: 'relative',
    zIndex: isDragging ? 20 : undefined,
    boxShadow: isDragging ? '0 12px 28px rgba(0,0,0,0.35)' : undefined,
    // Al levantarla, el fondo suave (con transparencia) se apoya sobre blanco para que la tarjeta no se vea translúcida.
    ...(isDragging && typeof style?.backgroundColor === 'string'
      ? { backgroundImage: `linear-gradient(${style.backgroundColor}, ${style.backgroundColor})`, backgroundColor: '#ffffff' }
      : {}),
    userSelect: 'none',
    WebkitTouchCallout: 'none',
  };
  return (
    <Etiqueta ref={setNodeRef as never} style={estilo} className={`${className} ${isDragging ? 'opacity-95' : ''}`} {...attributes} {...listeners}>
      {children}
    </Etiqueta>
  );
}
