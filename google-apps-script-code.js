// Código para Google Apps Script
// Ve a script.google.com y crea un nuevo proyecto
// Pega este código y despliégalo como Web App

const SPREADSHEET_ID = '1RfUO4RaK-R6SW50FGAVSEIa5kT7JMTEKgOPmFQ-o52M';

// Función para obtener o crear la hoja del mes actual
function obtenerHojaMes(fecha = new Date()) {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const nombresMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const nombreHoja = `${nombresMeses[fecha.getMonth()]} ${fecha.getFullYear()}`;
    let sheet = spreadsheet.getSheetByName(nombreHoja);

    // Si la hoja no existe, crearla
    if (!sheet) {
        sheet = spreadsheet.insertSheet(nombreHoja);

        // Agregar headers
        const headers = [
            'ID', 'Fecha', 'Vendedor', 'Cantidad', 'CostoDistribucion',
            'IngresoVendedor', 'ComisionMiguel', 'ComisionJeronimo',
            'DomicilioTotal', 'DomicilioVendedor', 'DomicilioSocios', 'GananciaOperador'
        ];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

        // Formatear headers
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
        sheet.getRange(1, 1, 1, headers.length).setBackground('#f0f0f0');
    }

    return sheet;
}

// Función para obtener hoja por nombre de mes específico
function obtenerHojaPorNombre(nombreMes) {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    return spreadsheet.getSheetByName(nombreMes);
}

// Función para obtener o crear la hoja de configuración
function obtenerHojaConfiguracion() {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName('Configuracion');

    // Si la hoja no existe, crearla con valores por defecto
    if (!sheet) {
        sheet = spreadsheet.insertSheet('Configuracion');

        // Configurar valores por defecto
        const configDefault = [
            ['precioDistribucion', 6000],
            ['precioVendedorPrimeros20', 7000],
            ['precioVendedorDespues20', 6500],
            ['comisionMiguelPorUnidad', 1000],
            ['comisionJeronimoPorUnidad', 500],
            ['limiteComisionMiguel', 20],
            ['domicilioTotal', 5000],
            ['nombreSocio1', 'Mildrey'],
            ['nombreSocio2', 'Miguel'],
            ['nombreSocio3', 'Jeronimo'],
            ['vendedores', 'Carlos,Maria,Pedro']
        ];

        // Escribir valores por defecto
        sheet.getRange(1, 1, configDefault.length, 2).setValues(configDefault);

        // Formatear
        sheet.getRange(1, 1, configDefault.length, 1).setFontWeight('bold');
        sheet.getRange(1, 1, configDefault.length, 2).setBackground('#f0f0f0');
        sheet.autoResizeColumns(1, 2);
    }

    return sheet;
}

// Función para obtener la configuración
function obtenerConfiguracion() {
    try {
        const sheet = obtenerHojaConfiguracion();
        const data = sheet.getDataRange().getValues();

        const config = {};
        data.forEach(row => {
            const key = row[0];
            let value = row[1];

            // Convertir vendedores de string a array
            if (key === 'vendedores') {
                value = value.split(',').map(v => v.trim()).filter(v => v);
            }
            // Convertir números
            else if (typeof value === 'string' && !isNaN(Number(value))) {
                value = Number(value);
            }

            config[key] = value;
        });

        return { success: true, data: config };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

// Función para guardar la configuración
function guardarConfiguracion(config) {
    try {
        const sheet = obtenerHojaConfiguracion();
        const data = sheet.getDataRange().getValues();

        // Actualizar cada valor
        for (let i = 0; i < data.length; i++) {
            const key = data[i][0];
            if (config.hasOwnProperty(key)) {
                let value = config[key];

                // Convertir array de vendedores a string
                if (key === 'vendedores' && Array.isArray(value)) {
                    value = value.join(',');
                }

                sheet.getRange(i + 1, 2).setValue(value);
            }
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

function doGet(e) {
    const action = e.parameter.action;
    const mes = e.parameter.mes; // Para consultas específicas de mes

    try {
        switch (action) {
            case 'obtenerVentas':
                return ContentService.createTextOutput(JSON.stringify(obtenerVentas()))
                    .setMimeType(ContentService.MimeType.JSON);
            case 'resumenSemanal':
                return ContentService.createTextOutput(JSON.stringify(obtenerResumenSemanal()))
                    .setMimeType(ContentService.MimeType.JSON);
            case 'resumenMensual':
                if (mes) {
                    return ContentService.createTextOutput(JSON.stringify(obtenerResumenMensualEspecifico(mes)))
                        .setMimeType(ContentService.MimeType.JSON);
                } else {
                    return ContentService.createTextOutput(JSON.stringify(obtenerResumenMensual()))
                        .setMimeType(ContentService.MimeType.JSON);
                }
            case 'mesesDisponibles':
                return ContentService.createTextOutput(JSON.stringify(obtenerMesesDisponibles()))
                    .setMimeType(ContentService.MimeType.JSON);
            case 'obtenerConfiguracion':
                return ContentService.createTextOutput(JSON.stringify(obtenerConfiguracion()))
                    .setMimeType(ContentService.MimeType.JSON);
            default:
                return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Acción no válida' }))
                    .setMimeType(ContentService.MimeType.JSON);
        }
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function doPost(e) {
    // Permitir CORS
    const response = ContentService.createTextOutput();
    response.setMimeType(ContentService.MimeType.JSON);

    try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action;

        let result;
        switch (action) {
            case 'agregarVenta':
                result = agregarVenta(data.data);
                break;
            case 'eliminarVenta':
                result = eliminarVenta(data.id);
                break;
            case 'guardarConfiguracion':
                result = guardarConfiguracion(data.config);
                break;
            default:
                result = { success: false, error: 'Acción no válida' };
        }

        response.setContent(JSON.stringify(result));
        return response;
    } catch (error) {
        response.setContent(JSON.stringify({ success: false, error: error.toString() }));
        return response;
    }
}

function agregarVenta(venta) {
    try {
        const fechaVenta = new Date(venta.fecha);
        const sheet = obtenerHojaMes(fechaVenta);
        const id = Utilities.getUuid();

        const row = [
            id,
            venta.fecha,
            venta.vendedor,
            venta.cantidad,
            venta.costoDistribucion,
            venta.ingresoVendedor,
            venta.comisionMiguel,
            venta.comisionJeronimo,
            venta.domicilioTotal,
            venta.domicilioVendedor,
            venta.domicilioSocios,
            venta.gananciaOperador
        ];

        sheet.appendRow(row);

        return { success: true, id: id };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

function obtenerVentas() {
    try {
        // Obtener ventas del mes actual
        const sheet = obtenerHojaMes();
        const data = sheet.getDataRange().getValues();

        if (data.length <= 1) return { success: true, data: [] };

        const ventas = data.slice(1).map(row => ({
            id: row[0],
            fecha: row[1],
            vendedor: row[2],
            cantidad: Number(row[3]) || 0,
            costoDistribucion: Number(row[4]) || 0,
            ingresoVendedor: Number(row[5]) || 0,
            comisionMiguel: Number(row[6]) || 0,
            comisionJeronimo: Number(row[7]) || 0,
            domicilioTotal: Number(row[8]) || 0,
            domicilioVendedor: Number(row[9]) || 0,
            domicilioSocios: Number(row[10]) || 0,
            gananciaOperador: Number(row[11]) || 0
        }));

        // Ordenar por fecha más reciente primero
        ventas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        return { success: true, data: ventas };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

function eliminarVenta(id) {
    try {
        // Buscar en la hoja del mes actual primero
        let sheet = obtenerHojaMes();
        let data = sheet.getDataRange().getValues();

        for (let i = 1; i < data.length; i++) {
            if (data[i][0] === id) {
                sheet.deleteRow(i + 1);
                return { success: true };
            }
        }

        // Si no se encuentra, buscar en hojas de meses anteriores
        const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheets = spreadsheet.getSheets();

        for (let sheet of sheets) {
            if (sheet.getName().includes('2024') || sheet.getName().includes('2025') || sheet.getName().includes('2026')) {
                data = sheet.getDataRange().getValues();
                for (let i = 1; i < data.length; i++) {
                    if (data[i][0] === id) {
                        sheet.deleteRow(i + 1);
                        return { success: true };
                    }
                }
            }
        }

        return { success: false, error: 'Venta no encontrada' };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

function obtenerResumenSemanal() {
    try {
        const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
        const data = sheet.getDataRange().getValues();

        if (data.length <= 1) return { success: true, data: null };

        // Obtener fecha de hace 7 días
        const haceUnaSemana = new Date();
        haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);

        // Filtrar ventas de la última semana
        const ventasSemana = data.slice(1).filter(row => {
            const fechaVenta = new Date(row[1]);
            return fechaVenta >= haceUnaSemana;
        });

        if (ventasSemana.length === 0) {
            return { success: true, data: null };
        }

        // Calcular totales
        let totalFacturado = 0;
        let totalSandwiches = 0;
        let comisionMiguel = 0;
        let comisionJeronimo = 0;
        let domicilioTotal = 0;
        let gananciaOperador = 0;

        ventasSemana.forEach(row => {
            totalFacturado += Number(row[5]) || 0; // ingresoVendedor
            totalSandwiches += Number(row[3]) || 0; // cantidad
            comisionMiguel += Number(row[6]) || 0;
            comisionJeronimo += Number(row[7]) || 0;
            domicilioTotal += Number(row[8]) || 0;
            gananciaOperador += Number(row[11]) || 0;
        });

        const resumen = {
            semana: `Últimos 7 días`,
            totalFacturado,
            totalSandwiches,
            comisionMiguel,
            comisionJeronimo,
            domicilioTotal,
            gananciaOperador
        };

        return { success: true, data: resumen };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

function obtenerResumenMensual() {
    try {
        // Obtener resumen del mes actual
        const sheet = obtenerHojaMes();
        const data = sheet.getDataRange().getValues();

        if (data.length <= 1) return { success: true, data: null };

        // Calcular totales del mes
        let totalFacturado = 0;
        let totalSandwiches = 0;
        let comisionMiguel = 0;
        let comisionJeronimo = 0;
        let domicilioTotal = 0;
        let gananciaOperador = 0;

        data.slice(1).forEach(row => {
            totalFacturado += Number(row[5]) || 0; // ingresoVendedor
            totalSandwiches += Number(row[3]) || 0; // cantidad
            comisionMiguel += Number(row[6]) || 0;
            comisionJeronimo += Number(row[7]) || 0;
            domicilioTotal += Number(row[8]) || 0;
            gananciaOperador += Number(row[11]) || 0;
        });

        const resumen = {
            mes: sheet.getName(),
            totalFacturado,
            totalSandwiches,
            comisionMiguel,
            comisionJeronimo,
            domicilioTotal,
            gananciaOperador
        };

        return { success: true, data: resumen };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

// Nueva función para obtener resumen de un mes específico
function obtenerResumenMensualEspecifico(nombreMes) {
    try {
        const sheet = obtenerHojaPorNombre(nombreMes);

        if (!sheet) {
            return { success: false, error: 'Mes no encontrado' };
        }

        const data = sheet.getDataRange().getValues();

        if (data.length <= 1) return { success: true, data: null };

        // Calcular totales del mes específico
        let totalFacturado = 0;
        let totalSandwiches = 0;
        let comisionMiguel = 0;
        let comisionJeronimo = 0;
        let domicilioTotal = 0;
        let gananciaOperador = 0;

        data.slice(1).forEach(row => {
            totalFacturado += Number(row[5]) || 0;
            totalSandwiches += Number(row[3]) || 0;
            comisionMiguel += Number(row[6]) || 0;
            comisionJeronimo += Number(row[7]) || 0;
            domicilioTotal += Number(row[8]) || 0;
            gananciaOperador += Number(row[11]) || 0;
        });

        const resumen = {
            mes: nombreMes,
            totalFacturado,
            totalSandwiches,
            comisionMiguel,
            comisionJeronimo,
            domicilioTotal,
            gananciaOperador
        };

        return { success: true, data: resumen };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}

// Función para listar todos los meses disponibles
function obtenerMesesDisponibles() {
    try {
        const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
        const sheets = spreadsheet.getSheets();

        const meses = sheets
            .map(sheet => sheet.getName())
            .filter(nombre => nombre.includes('2024') || nombre.includes('2025') || nombre.includes('2026'))
            .sort();

        return { success: true, data: meses };
    } catch (error) {
        return { success: false, error: error.toString() };
    }
}