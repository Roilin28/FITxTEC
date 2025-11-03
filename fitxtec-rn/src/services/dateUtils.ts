/**
 * Utilidades para manejo de fechas en formato YYYY-MM-DD
 * Maneja zonas horarias correctamente para evitar desplazamientos de día
 */

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD en zona horaria local
 * Evita problemas de timezone al usar toISOString()
 */
export function getTodayLocal(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convierte una fecha string (YYYY-MM-DD o YYYY-MM-DDTHH:MM:SS) a Date object en zona local
 * Sin conversión a UTC que pueda cambiar el día
 */
export function parseLocalDate(dateString: string): Date {
  // Si tiene formato con hora (YYYY-MM-DDTHH:MM:SS)
  if (dateString.includes('T')) {
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    if (timePart) {
      const [hour, minute, second] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0, 0);
    }
  }
  // Solo fecha (YYYY-MM-DD)
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Formatea una fecha a YYYY-MM-DD en zona local
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene el primer día del mes en formato YYYY-MM-DD
 */
export function getFirstDayOfMonth(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-01`;
}

/**
 * Obtiene el último día del mes en formato YYYY-MM-DD
 */
export function getLastDayOfMonth(year: number, month: number): string {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

/**
 * Verifica si dos fechas (YYYY-MM-DD) son el mismo día
 */
export function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

