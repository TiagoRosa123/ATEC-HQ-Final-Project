import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/pt'; // Importar locale português
import Container from 'react-bootstrap/Container';

// Configurar localizer
moment.locale('pt');
const localizer = momentLocalizer(moment);

const ScheduleCalendar = ({ events, defaultView = 'week' }) => {
  // Tradução dos textos do calendário
  const messages = {
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

  // Estilizar eventos (cores)
  const eventStyleGetter = (event) => {
    const backgroundColor = event.color || '#3174ad';
    const style = {
      backgroundColor,
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return {
      style: style
    };
  };

  return (
    <Container fluid className="p-3 bg-white rounded shadow-sm">
      <div style={{ height: '75vh' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          messages={messages}
          defaultView={defaultView}
          views={['month', 'week', 'day', 'agenda']}
          eventPropGetter={eventStyleGetter}
          min={new Date(0, 0, 0, 8, 0, 0)} // Começar às 8h
          max={new Date(0, 0, 0, 23, 0, 0)} // Terminar às 23h
          formats={{
            dayHeaderFormat: 'dddd, DD MMMM',
          }}
        />
      </div>
    </Container>
  );
};

export default ScheduleCalendar;
