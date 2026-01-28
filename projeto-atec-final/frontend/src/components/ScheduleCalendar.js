import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'; // Estilos do D&D
import 'moment/locale/pt'; 
import Container from 'react-bootstrap/Container';

moment.locale('pt');
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const ScheduleCalendar = ({ events, defaultView = 'week', onSelectSlot, onSelectEvent, onEventDrop, onEventResize }) => {
  const messages = {
    // ... (mantém igual)
    allDay: 'Dia todo',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Sem aulas neste período.',
  };

  const eventStyleGetter = (event) => {
      // ... (mantém igual)
    const backgroundColor = event.color || '#3174ad';
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <Container fluid className="p-3 bg-white rounded shadow-sm">
      <div style={{ height: '75vh' }}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          messages={messages}
          defaultView={defaultView}
          views={['month', 'week', 'day', 'agenda']}
          eventPropGetter={eventStyleGetter}
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 23, 0, 0)}
          formats={{
            dayHeaderFormat: 'dddd, DD MMMM',
          }}
          selectable
          resizable
          onSelectSlot={onSelectSlot}
          onSelectEvent={onSelectEvent} // Adicionado!
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
        />
      </div>
    </Container>
  );
};

export default ScheduleCalendar;
