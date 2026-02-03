
export interface Member {
  id?: string;
  nombresCompletos: string;
  apellidosCompletos: string;
  cedula: string;
  fechaNacimiento: string;
  genero: string;
  estadoCivil: string;
  nacionalidad: string;
  discapacidadTipo: string;
  discapacidadPorcentaje: string;
  carnetRegistro: string;
  discapacidadMultiple: string; // Now "Si" or "No" primarily
  ayudasTecnicas: string;
  condicionSalud: string;
  provinciaCanton: string; // Used as "Provincia" for charts mostly
  parroquiaBarrio: string;
  direccionDomiciliaria: string;
  referencia: string;
  celular: string;
  convencional: string;
  email: string;
  nombreRepresentante: string;
  parentesco: string;
  cedulaRepresentante: string;
  contactoEmergencia: string;
  nivelInstruccion: string;
  ocupacionActual: string;
  ingresosMensuales: string;
  tipoVivienda: string;
  bonoDesarrollo: string;
  fechaIngreso: string;
  estadoSocio: string;
  aportesMensuales: string;
  comiteComision: string;
  habilidadesTalentos: string;
  tipoDeSocio: string;
  numeroRegistroMies: string;
  observaciones: string;
  linkCedulaDigital?: string;
}

export interface ApiResponse {
  result?: string;
  message?: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  avgDisability: number;
  totalProvinces: number;
  disabilityDistribution: { name: string; value: number }[];
  provinceDistribution: { name: string; value: number }[];
  // New Stats
  genderDistribution: { name: string; value: number }[];
  percentageRanges: { name: string; value: number }[];
  educationDistribution: { name: string; value: number }[];
  statusDistribution: { name: string; value: number }[];
  typeDistribution: { name: string; value: number }[];
}
