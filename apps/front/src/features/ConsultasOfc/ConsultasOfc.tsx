import React from 'react';

const ConsultasOfc: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src="https://apollo-crm.consultasofc.com.br"
        title="Consultas"
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="fullscreen"
      />
    </div>
  );
};

export default ConsultasOfc;
