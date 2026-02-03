import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { Save, X, Upload, CheckSquare, Square, Copy } from 'lucide-react';

interface MemberFormProps {
  initialData?: Member;
  onSubmit: (data: Partial<Member>, file?: { data: string; name: string }) => Promise<void>;
  onCancel: () => void;
}

const initialFormState: Partial<Member> = {
  nacionalidad: 'Ecuatoriana',
  estadoSocio: 'Activo',
  provinciaCanton: '',
  comiteComision: '',
  tipoDeSocio: 'Adherente',
  bonoDesarrollo: 'No',
  discapacidadPorcentaje: '0',
  discapacidadMultiple: 'No'
};

const COMISION_OPTIONS = [
  "Presidente",
  "Presidente Provincial",
  "Deportes",
  "Salud",
  "Empleo",
  "Asuntos Sociales",
  "Ministerios",
  "Conadis",
  "Asuntos Legales"
];

const PROVINCIAS_ECUADOR = [
  "Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi", "El Oro", "Esmeraldas", 
  "Galápagos", "Guayas", "Imbabura", "Loja", "Los Ríos", "Manabí", "Morona Santiago", "Napo", 
  "Orellana", "Pastaza", "Pichincha", "Santa Elena", "Santo Domingo de los Tsáchilas", 
  "Sucumbíos", "Tungurahua", "Zamora Chinchipe"
];

const OCUPACIONES = [
  "Estudiante",
  "Empleado Privado",
  "Empleado Público",
  "Comerciante",
  "Agricultor",
  "Jubilado",
  "Desempleado",
  "Hogar",
  "Otra"
];

const TIPOS_VIVIENDA = [
  "Propia",
  "Arrendada",
  "Prestada / Familiar",
  "Anticresis"
];

const MemberForm: React.FC<MemberFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Member>>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<{ data: string; name: string } | undefined>(undefined);
  const [showCommissionDropdown, setShowCommissionDropdown] = useState(false);
  
  // Logic for "Otra" occupation
  const [isCustomOccupation, setIsCustomOccupation] = useState(false);
  const [customOccupation, setCustomOccupation] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      
      // Check if occupation is in the standard list
      if (initialData.ocupacionActual && !OCUPACIONES.includes(initialData.ocupacionActual)) {
        setIsCustomOccupation(true);
        setCustomOccupation(initialData.ocupacionActual);
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // VALIDATION LOGIC
    if (name === 'celular') {
      // Only digits
      const numericValue = value.replace(/\D/g, '');
      // Max length 10
      if (numericValue.length > 10) return;
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    if (name === 'cedula') {
      // Only digits, max length 10
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length > 10) return;
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlurCelular = () => {
    // Validate starts with 09 on blur
    if (formData.celular && !formData.celular.startsWith('09') && formData.celular.length > 0) {
      alert('El número de celular debe empezar con "09"');
    }
  };

  const handleOccupationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'Otra') {
      setIsCustomOccupation(true);
      setFormData(prev => ({ ...prev, ocupacionActual: customOccupation }));
    } else {
      setIsCustomOccupation(false);
      setFormData(prev => ({ ...prev, ocupacionActual: value }));
    }
  };

  const handleCustomOccupationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomOccupation(value);
    setFormData(prev => ({ ...prev, ocupacionActual: value }));
  };

  const handleCommissionToggle = (option: string) => {
    const current = formData.comiteComision ? formData.comiteComision.split(',').map(s => s.trim()) : [];
    let updated: string[];
    if (current.includes(option)) {
      updated = current.filter(item => item !== option);
    } else {
      updated = [...current, option];
    }
    setFormData(prev => ({ ...prev, comiteComision: updated.join(', ') }));
  };

  const handleCopyCedula = () => {
    if (formData.cedula) {
      setFormData(prev => ({ ...prev, carnetRegistro: formData.cedula }));
    } else {
      alert("Ingrese primero la Cédula");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFile({
            data: event.target.result.toString(),
            name: selectedFile.name
          });
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final Validations
    if (formData.celular && (!formData.celular.startsWith('09') || formData.celular.length !== 10)) {
        alert('El celular debe tener 10 dígitos y empezar con 09');
        return;
    }
    if (formData.cedula && formData.cedula.length !== 10) {
        alert('La cédula debe tener 10 dígitos');
        return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, file);
    } catch (error) {
      console.error(error);
      alert('Hubo un error al guardar. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCommissions = formData.comiteComision ? formData.comiteComision.split(',').map(s => s.trim()) : [];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {initialData ? 'Editar Socio' : 'Registro de Nuevo Socio'}
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Sección 1: Datos Personales */}
        <fieldset>
          <legend className="text-lg font-semibold text-brand-600 mb-4 border-b border-gray-200 w-full pb-2">Datos Personales</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cédula * (10 dígitos)</label>
              <input 
                required 
                name="cedula" 
                value={formData.cedula || ''} 
                onChange={handleChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-brand-500 focus:border-brand-500" 
                placeholder="0000000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombres Completos *</label>
              <input required name="nombresCompletos" value={formData.nombresCompletos || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellidos Completos *</label>
              <input required name="apellidosCompletos" value={formData.apellidosCompletos || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Nacimiento</label>
              <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toISOString().split('T')[0] : ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Género</label>
              <select name="genero" value={formData.genero || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                <option value="">Seleccione</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="LGBTIQ+">LGBTIQ+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado Civil</label>
              <select name="estadoCivil" value={formData.estadoCivil || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                <option value="">Seleccione</option>
                <option value="Soltero">Soltero/a</option>
                <option value="Casado">Casado/a</option>
                <option value="Divorciado">Divorciado/a</option>
                <option value="Viudo">Viudo/a</option>
                <option value="Union Libre">Unión Libre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nacionalidad</label>
              <input name="nacionalidad" value={formData.nacionalidad || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nivel de Instrucción</label>
              <select name="nivelInstruccion" value={formData.nivelInstruccion || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                <option value="">Seleccione</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
                <option value="Tercer Nivel">Tercer Nivel</option>
                <option value="Cuarto Nivel">Cuarto Nivel</option>
                <option value="Sin Instruccion">Sin Instrucción</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Condición de Salud</label>
              <input name="condicionSalud" value={formData.condicionSalud || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="Ej: Diabetes, Hipertensión" />
            </div>
          </div>
        </fieldset>

        {/* Sección 2: Discapacidad */}
        <fieldset>
          <legend className="text-lg font-semibold text-brand-600 mb-4 border-b border-gray-200 w-full pb-2">Datos de Discapacidad</legend>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Tipo de Discapacidad *</label>
              <select required name="discapacidadTipo" value={formData.discapacidadTipo || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                <option value="">Seleccione</option>
                <option value="Fisica">Física</option>
                <option value="Auditiva">Auditiva</option>
                <option value="Visual">Visual</option>
                <option value="Intelectual">Intelectual</option>
                <option value="Psicosocial">Psicosocial</option>
                <option value="Lenguaje">Lenguaje</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Porcentaje (%) *</label>
              <input required type="number" name="discapacidadPorcentaje" value={formData.discapacidadPorcentaje || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" min="0" max="100" />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Nro. Carnet/Registro</label>
              <div className="flex gap-2">
                <input name="carnetRegistro" value={formData.carnetRegistro || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                <button 
                  type="button" 
                  onClick={handleCopyCedula}
                  className="mt-1 p-2 bg-gray-200 hover:bg-gray-300 rounded border border-gray-300 text-gray-600"
                  title="Copiar Cédula"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700">Discapacidad Múltiple</label>
               <select name="discapacidadMultiple" value={formData.discapacidadMultiple || 'No'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                  <option value="No">No</option>
                  <option value="Si">Sí</option>
               </select>
            </div>
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700">Ayudas Técnicas</label>
               <input name="ayudasTecnicas" value={formData.ayudasTecnicas || ''} onChange={handleChange} placeholder="Ej: Silla de ruedas, Bastón" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
          </div>
        </fieldset>

         {/* Sección 3: Datos Socioeconómicos */}
         <fieldset>
          <legend className="text-lg font-semibold text-brand-600 mb-4 border-b border-gray-200 w-full pb-2">Datos Socioeconómicos</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700">Ocupación Actual</label>
              <select 
                value={isCustomOccupation ? 'Otra' : (formData.ocupacionActual || '')} 
                onChange={handleOccupationChange} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              >
                <option value="">Seleccione</option>
                {OCUPACIONES.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
              {isCustomOccupation && (
                <input 
                  type="text" 
                  value={customOccupation} 
                  onChange={handleCustomOccupationChange}
                  placeholder="Especifique su ocupación" 
                  className="mt-2 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-gray-50" 
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ingresos Mensuales ($)</label>
              <input type="number" name="ingresosMensuales" value={formData.ingresosMensuales || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Vivienda</label>
              <select name="tipoVivienda" value={formData.tipoVivienda || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                <option value="">Seleccione</option>
                {TIPOS_VIVIENDA.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bono de Desarrollo</label>
              <select name="bonoDesarrollo" value={formData.bonoDesarrollo || 'No'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                <option value="No">No</option>
                <option value="Si">Sí</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Habilidades / Talentos</label>
              <input name="habilidadesTalentos" value={formData.habilidadesTalentos || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="Ej: Música, Manualidades, Deporte" />
            </div>
          </div>
        </fieldset>

        {/* Sección 4: Ubicación y Contacto */}
        <fieldset>
          <legend className="text-lg font-semibold text-brand-600 mb-4 border-b border-gray-200 w-full pb-2">Ubicación y Contacto</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700">Provincia *</label>
              {/* Dropdown for Provinces */}
              <select required name="provinciaCanton" value={formData.provinciaCanton || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                <option value="">Seleccione Provincia</option>
                {PROVINCIAS_ECUADOR.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cantón / Parroquia</label>
              <input name="parroquiaBarrio" value={formData.parroquiaBarrio || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="Cantón y/o Parroquia" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Dirección Domiciliaria</label>
              <input name="direccionDomiciliaria" value={formData.direccionDomiciliaria || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Referencia</label>
              <input name="referencia" value={formData.referencia || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="Ej: Frente al parque" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Celular * (Inicia con 09)</label>
              <input 
                name="celular" 
                value={formData.celular || ''} 
                onChange={handleChange} 
                onBlur={handleBlurCelular}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
                placeholder="09..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono Convencional</label>
              <input name="convencional" value={formData.convencional || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Contacto de Emergencia</label>
              <input name="contactoEmergencia" value={formData.contactoEmergencia || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="Nombre y Teléfono" />
            </div>
          </div>
        </fieldset>

        {/* Sección 5: Representante (NUEVA) */}
        <fieldset>
          <legend className="text-lg font-semibold text-brand-600 mb-4 border-b border-gray-200 w-full pb-2">Datos del Representante (Si aplica)</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-gray-700">Nombre del Representante</label>
               <input name="nombreRepresentante" value={formData.nombreRepresentante || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700">Parentesco</label>
               <input name="parentesco" value={formData.parentesco || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="Ej: Madre, Padre, Tío" />
            </div>
          </div>
        </fieldset>
        
        {/* Sección 6: Información Institucional y Archivo */}
        <fieldset>
          <legend className="text-lg font-semibold text-brand-600 mb-4 border-b border-gray-200 w-full pb-2">AEDIS y Documentación</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700">Estado del Socio</label>
              <select name="estadoSocio" value={formData.estadoSocio || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Socio</label>
              <select name="tipoDeSocio" value={formData.tipoDeSocio || 'Adherente'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                <option value="Fundador">Fundador</option>
                <option value="Adherente">Adherente</option>
                <option value="Honorario">Honorario</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Ingreso</label>
              <input type="date" name="fechaIngreso" value={formData.fechaIngreso ? new Date(formData.fechaIngreso).toISOString().split('T')[0] : ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">No. Registro MIES</label>
              <input type="number" name="numeroRegistroMies" value={formData.numeroRegistroMies || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
            </div>
             
             {/* Multi-Select for Comite/Comision */}
             <div className="relative md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Comité / Comisión</label>
              <div 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white cursor-pointer min-h-[42px]"
                onClick={() => setShowCommissionDropdown(!showCommissionDropdown)}
              >
                {formData.comiteComision ? (
                   <span className="text-sm">{formData.comiteComision}</span>
                ) : (
                   <span className="text-gray-400 text-sm">Seleccione...</span>
                )}
              </div>
              
              {showCommissionDropdown && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded shadow-lg max-h-60 overflow-y-auto">
                  {COMISION_OPTIONS.map(option => (
                    <div 
                      key={option} 
                      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleCommissionToggle(option)}
                    >
                      {selectedCommissions.includes(option) ? (
                        <CheckSquare size={18} className="text-brand-600 mr-2" />
                      ) : (
                        <Square size={18} className="text-gray-400 mr-2" />
                      )}
                      <span className="text-sm">{option}</span>
                    </div>
                  ))}
                  <div 
                    className="p-2 bg-gray-50 text-center text-brand-600 font-semibold cursor-pointer border-t text-sm"
                    onClick={() => setShowCommissionDropdown(false)}
                  >
                    Cerrar
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
              <textarea name="observaciones" rows={3} value={formData.observaciones || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="Información adicional relevante..." />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cédula Digital (PDF o Imagen)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click para subir</span></p>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG (MAX. 5MB)</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,image/*" />
                </label>
              </div>
              {file && <p className="text-sm text-green-600 mt-2">Nuevo archivo: {file.name}</p>}
              {initialData?.linkCedulaDigital && !file && (
                <p className="text-sm text-blue-600 mt-2">Documento actual registrado.</p>
              )}
            </div>
          </div>
        </fieldset>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700 flex items-center gap-2 font-medium shadow-sm disabled:opacity-50"
            disabled={loading}
          >
            <Save size={18} />
            {loading ? 'Guardando...' : 'Guardar Socio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;