import React from 'react';
import { Member } from '../types';
import { User, MapPin, Activity, FileText, Briefcase } from 'lucide-react';

interface MemberCardProps {
  member: Member | null;
  onClose: () => void;
}

// Componente para mostrar PDF o imagen con manejo de error universal
function UniversalViewer(props: { src: string; isPdf: boolean }) {
  const { src, isPdf } = props;
  const [error, setError] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setError(true), 3000);
    return () => clearTimeout(timer);
  }, [src]);
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6 text-center">
        <div className="text-red-500 text-lg font-bold mb-2">No se pudo cargar el archivo.</div>
        <div className="text-gray-700">Verifique el enlace, permisos o formato del archivo en Google Drive.</div>
      </div>
    );
  }
  return isPdf ? (
    <iframe src={src} title="Cédula Digital PDF" className="w-full h-[70vh] border rounded" />
  ) : (
    <img src={src} alt="Cédula Digital" className="w-full max-h-[70vh] object-contain border rounded" onError={() => setError(true)} />
  );
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onClose }) => {
  const [showCedula, setShowCedula] = React.useState(false);
  if (!member) return null;
  // Transformar enlace de Google Drive a enlace directo (robusto)
  let cedulaUrl = member.linkCedulaDigital || '';
  let originalCedulaUrl = cedulaUrl;
  // Extraer ID aunque haya parámetros extra
  let fileId = '';
  const idMatch = cedulaUrl.match(/drive\.google\.com\/file\/d\/([\w-]+)(?:\/|$)/);
  if (idMatch) {
    fileId = idMatch[1];
    cedulaUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  const isPdf = originalCedulaUrl.toLowerCase().includes('.pdf');
  return (
    // 'modal-print-wrapper' is the key class used in index.html @media print
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4 modal-print-wrapper">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-print-content">
        
        {/* Header - Control Buttons (Hidden in Print) */}
        <div className="flex justify-between items-center p-4 border-b no-print bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">Ficha de Socio</h2>
          <div className="flex gap-2">
            {member?.linkCedulaDigital ? (
              <a
                href={originalCedulaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm"
                title="Ver Cédula Digital"
              >
                <FileText size={18} /> Ver Cédula Digital
              </a>
            ) : (
              <span className="text-xs text-gray-400 ml-2">No hay cédula digital registrada</span>
            )}
            <button 
              onClick={() => {
                setTimeout(() => window.print(), 100);
              }} 
              className="bg-brand-600 text-white px-4 py-2 rounded hover:bg-brand-700 flex items-center gap-2 transition-colors shadow-sm"
            >
              <FileText size={18} /> Imprimir
            </button>
            <button 
              onClick={onClose} 
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors shadow-sm"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Card Content - Printable Area */}
        <div className="p-8 print:p-2 space-y-6 print:space-y-1" id="printable-section">
          
          {/* Header Section with Logo */}
          <div className="flex justify-between items-center border-b-2 border-brand-500 pb-4 mb-6 print:pb-1 print:mb-1 print:border-b">
            <div className="flex items-center gap-4 print:gap-2">
              {/* Logo Integration */}
              <img 
                src="/logo.png" 
                alt="AEDIS Logo" 
                className="h-20 w-auto object-contain print:h-12"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'; // Hide if not found
                }}
              />
              <div>
                <h1 className="text-3xl font-bold text-brand-900 uppercase tracking-wide print:text-lg leading-none">AEDIS</h1>
                <p className="text-sm text-gray-500 print:text-[8px]">Asociación Ecuatoriana del Acuerdo por la Discapacidad</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-400 print:text-[8px]">Nro. Registro</div>
              <div className="text-xl font-bold text-gray-800 print:text-sm">{member.carnetRegistro || 'S/N'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-2">
            
            {/* Left Column: Primary Info */}
            <div className="md:col-span-1 space-y-4 print:space-y-1">
              
              <div className="bg-brand-50 p-4 rounded-lg print:bg-white print:border print:border-gray-200 print:p-1.5">
                <h3 className="font-bold text-brand-800 mb-2 print:text-[10px] print:mb-0.5">Estado</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  member.estadoSocio === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                } print:border print:border-gray-300 print:text-[9px] print:px-1.5 print:py-0`}>
                  {member.estadoSocio || 'Indefinido'}
                </span>
                
                <div className="mt-3 pt-3 border-t border-brand-200 print:mt-1.5 print:pt-1">
                  <p className="text-xs text-gray-500 print:text-[8px]">Tipo de Socio</p>
                  <p className="font-medium text-gray-700 print:text-[10px]">{member.tipoDeSocio || 'Adherente'}</p>
                </div>

                <div className="mt-2 print:mt-1">
                  <p className="text-xs text-gray-500 print:text-[8px]">Fecha Ingreso</p>
                  <p className="font-medium text-gray-700 print:text-[10px]">{member.fechaIngreso ? new Date(member.fechaIngreso).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

                {/* Quick Contact Box eliminado, movido a sección de representante */}
            </div>

            {/* Right Column: Detailed Info */}
            <div className="md:col-span-2 space-y-6 print:space-y-1.5">
              
              {/* Personal Data */}
              <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-brand-700 mb-3 border-b border-gray-200 pb-1 print:text-xs print:mb-0.5 print:border-b-0 print:pb-0">
                  <User size={20} className="print:w-3 print:h-3" /> Datos Personales
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm print:text-xs print:gap-x-2 print:gap-y-0.5">
                  <div>
                    <span className="block text-gray-500 text-xs print:text-[8px]">Apellidos</span>
                    <span className="font-semibold text-gray-800 uppercase print:text-[10px]">{member.apellidosCompletos}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs print:text-[8px]">Nombres</span>
                    <span className="font-semibold text-gray-800 uppercase print:text-[10px]">{member.nombresCompletos}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs print:text-[8px]">Cédula</span>
                    <span className="font-medium print:text-[10px]">{member.cedula}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs print:text-[8px]">Nacionalidad</span>
                    <span className="font-medium print:text-[10px]">{member.nacionalidad}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs print:text-[8px]">Fecha Nacimiento</span>
                    <span className="font-medium print:text-[10px]">{member.fechaNacimiento ? new Date(member.fechaNacimiento).toLocaleDateString() : 'N/A'}</span>
                  </div>
                   <div>
                    <span className="block text-gray-500 text-xs print:text-[8px]">Estado Civil</span>
                    <span className="font-medium print:text-[10px]">{member.estadoCivil}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs print:text-[8px]">Nivel Instrucción</span>
                    <span className="font-medium print:text-[10px]">{member.nivelInstruccion}</span>
                  </div>
                  <div>
                     <span className="block text-gray-500 text-xs print:text-[8px]">Condición Salud</span>
                     <span className="font-medium print:text-[10px]">{member.condicionSalud || 'N/A'}</span>
                  </div>
                </div>
              </section>

                {/* Representative Data (Solo si existe) */}
                {(member.nombreRepresentante || member.parentesco) && (
                 <section className="bg-blue-50 p-3 rounded border border-blue-100 print:bg-transparent print:border-gray-200 print:p-1">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2 print:text-brand-700 print:mb-0.5 print:text-[10px]">
                    Datos del Representante (Si aplica)
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm print:text-xs print:gap-x-2 print:gap-y-0.5">
                    <div>
                      <span className="block text-gray-500 text-xs print:text-[8px]">Nombre</span>
                      <span className="font-medium print:text-[10px]">{member.nombreRepresentante}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs print:text-[8px]">Parentesco</span>
                      <span className="font-medium print:text-[10px]">{member.parentesco}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs print:text-[8px]">Cédula del Representante</span>
                      <span className="font-medium print:text-[10px]">{member.cedulaRepresentante || 'No registrada'}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500 text-xs print:text-[8px]">Contacto Emergencia</span>
                      <span className="font-medium print:text-[10px]">{member.contactoEmergencia || 'No registrado'}</span>
                    </div>
                  </div>
                 </section>
                )}

              {/* Socio-economic Data */}
              <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-brand-700 mb-3 border-b border-gray-200 pb-1 print:text-xs print:mb-0.5 print:border-b-0 print:pb-0">
                  <Briefcase size={20} className="print:w-3 print:h-3" /> Datos Socioeconómicos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm print:text-xs print:gap-x-2 print:gap-y-0.5">
                   <div className="md:col-span-2">
                      <span className="block text-gray-500 text-xs print:text-[8px]">Ocupación Actual</span>
                      <span className="font-medium print:text-[10px]">{member.ocupacionActual || 'No registrada'}</span>
                   </div>
                   <div>
                      <span className="block text-gray-500 text-xs print:text-[8px]">Ingresos ($)</span>
                      <span className="font-medium print:text-[10px]">{member.ingresosMensuales ? `$${member.ingresosMensuales}` : 'N/A'}</span>
                   </div>
                   <div>
                      <span className="block text-gray-500 text-xs print:text-[8px]">Bono Desarrollo</span>
                      <span className="font-medium print:text-[10px]">{member.bonoDesarrollo}</span>
                   </div>
                   <div className="md:col-span-2">
                      <span className="block text-gray-500 text-xs print:text-[8px]">Tipo Vivienda</span>
                      <span className="font-medium print:text-[10px]">{member.tipoVivienda}</span>
                   </div>
                   <div className="md:col-span-2">
                      <span className="block text-gray-500 text-xs print:text-[8px]">Habilidades / Talentos</span>
                      <span className="font-medium print:text-[10px]">{member.habilidadesTalentos || 'Ninguna'}</span>
                   </div>
                </div>
              </section>

              {/* Disability Info */}
              <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-brand-700 mb-3 border-b border-gray-200 pb-1 print:text-xs print:mb-0.5 print:border-b-0 print:pb-0">
                  <Activity size={20} className="print:w-3 print:h-3" /> Información Discapacidad
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm print:text-xs print:gap-x-2 print:gap-y-0.5">
                  <div className="md:col-span-2">
                    <span className="block text-gray-500 text-xs print:text-[8px]">Tipo Discapacidad</span>
                    <span className="font-semibold text-gray-800 print:text-[10px]">{member.discapacidadTipo}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs print:text-[8px]">Porcentaje</span>
                    <span className="font-bold text-brand-600 text-lg print:text-xs">{member.discapacidadPorcentaje}%</span>
                  </div>
                  <div className="md:col-span-3">
                    <span className="block text-gray-500 text-xs print:text-[8px]">Ayudas Técnicas</span>
                    <span className="font-medium print:text-[10px]">{member.ayudasTecnicas || 'Ninguna'}</span>
                  </div>
                   {(member.discapacidadMultiple === 'Si' || member.discapacidadMultiple === 'Sí') && (
                    <div className="md:col-span-3">
                      <span className="block text-gray-500 text-xs print:text-[8px]">Discapacidad Múltiple</span>
                      <span className="font-medium print:text-[10px]">Sí</span>
                    </div>
                   )}
                </div>
              </section>

              {/* Contact Info */}
              <section>
                <h3 className="flex items-center gap-2 text-lg font-bold text-brand-700 mb-3 border-b border-gray-200 pb-1 print:text-xs print:mb-0.5 print:border-b-0 print:pb-0">
                  <MapPin size={20} className="print:w-3 print:h-3" /> Ubicación y Contacto
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm print:text-xs print:gap-x-2 print:gap-y-0.5">
                  <div>
                    <span className="block text-gray-500 text-xs print:text-[8px]">Provincia</span>
                    <span className="font-medium print:text-[10px]">{member.provinciaCanton}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs print:text-[8px]">Cantón / Parroquia</span>
                    <span className="font-medium print:text-[10px]">{member.parroquiaBarrio}</span>
                  </div>
                   <div>
                    <span className="block text-gray-500 text-xs print:text-[8px]">Celular</span>
                    <span className="font-medium print:text-[10px]">{member.celular}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs print:text-[8px]">Convencional</span>
                    <span className="font-medium print:text-[10px]">{member.convencional || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-gray-500 text-xs print:text-[8px]">Dirección</span>
                    <span className="font-medium print:text-[10px] leading-tight">{member.direccionDomiciliaria}</span>
                  </div>
                  <div className="col-span-2">
                     <span className="block text-gray-500 text-xs print:text-[8px]">Referencia</span>
                     <span className="font-medium italic text-gray-600 print:text-[10px] leading-tight">{member.referencia}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-gray-500 text-xs print:text-[8px]">Email</span>
                    <span className="font-medium text-brand-600 print:text-[10px]">{member.email}</span>
                  </div>
                </div>
              </section>
              
              {/* Additional Info Footer */}
               <section className="bg-gray-50 p-3 rounded text-xs text-gray-600 print:bg-transparent print:border print:border-gray-200 print:p-1.5 print:text-[9px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-x-2 print:gap-y-1">
                     <div>
                        <strong>Comisión:</strong> {member.comiteComision}
                     </div>
                     <div>
                        <strong>Reg. MIES:</strong> {member.numeroRegistroMies || 'N/A'}
                     </div>
                     {member.observaciones && (
                       <div className="col-span-2 mt-2 pt-2 border-t border-gray-200 print:mt-1 print:pt-0.5">
                          <strong>Observaciones:</strong>
                          <p className="mt-1 text-gray-500 italic print:text-[9px] leading-tight">{member.observaciones}</p>
                       </div>
                     )}
                  </div>
               </section>

            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-300 flex justify-between items-end text-xs text-gray-400 print:mt-1 print:pt-1 print:text-[8px]">
             <div>
                <p>Generado por Sistema AEDIS</p>
                <p>{new Date().toLocaleString()}</p>
             </div>
             <div className="text-right">
                <p className="font-bold text-gray-800 uppercase">AEDIS ECUADOR</p>
             </div>
          </div>
          {/* Modal de cédula digital eliminado, solo acceso directo */}
        </div>
      </div>
    </div>
  );
};

export default MemberCard;