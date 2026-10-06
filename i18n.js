/* ==========================================================================
   LANCE INTERNACIONAL | Cambio de idioma en vivo (ES / EN)

   El HTML se escribe en español. Al elegir EN, los textos se traducen en el
   mismo documento, sin recargar ni abrir otra página. El diccionario va en
   ambos sentidos, así que volver a ES restaura el texto original.

   - Para corregir o agregar una traducción: editar DICT (español: inglés).
   - Lo que genera script.js (ensayos, formulario, globo...) usa t(es, en) allá
     y se actualiza al escuchar el evento "langchange".
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- Diccionario: texto en español -> texto en inglés ---------- */
  const DICT = {
    "Lance Internacional | Minería de oro, plata y platinoides en Coahuila, México": "Lance Internacional | Gold, silver and platinum-group metals mining in Coahuila, Mexico",
    "Lance Internacional: consorcio minero en Monclova, Coahuila, con concesiones de oro, plata y platinoides y alianza con un socio tecnológico de Corea del Sur para exportar lingotes bullion.": "Lance Internacional: a mining consortium in Monclova, Coahuila, with gold, silver and platinum-group metal concessions and an alliance with a South Korean technology partner to export bullion ingots.",
    "Saltar al contenido": "Skip to content",
    "Cargando Lance Internacional": "Loading Lance Internacional",
    "Consorcio minero": "Mining consortium",
    "Inicializando": "Initializing",
    "Lance Internacional, ir al inicio": "Lance Internacional, go to top",
    "Principal": "Primary",
    "Empresa": "Company",
    "Operación": "Operations",
    "Metales": "Metals",
    "Proceso": "Process",
    "Alianza": "Alliance",
    "Contacto": "Contact",
    "Solicitar reunión": "Request a meeting",
    "Abrir menú": "Open menu",
    "Menú móvil": "Mobile menu",
    "Consorcio minero mexicano": "Mexican mining consortium",
    "Oro, plata y platinoides desde el norte de México": "Gold, silver and platinum-group metals from northern Mexico",
    "Oro, plata y": "Gold, silver and",
    "platinoides": "PGMs",
    "paladio": "palladium",
    "platino": "platinum",
    "iridio": "iridium",
    "rodio": "rhodium",
    "rutenio": "ruthenium",
    "osmio": "osmium",
    "desde el norte de México": "from northern Mexico",
    "Más de 70 mil hectáreas concesionadas y alianza con Corea del Sur para fundir y exportar lingotes bullion.": "More than 70 thousand hectares under concession and an alliance with South Korea to smelt and export bullion ingots.",
    "Conocer la operación": "Explore the operation",
    "Globo terráqueo animado con rutas de exportación desde Monclova, México, hacia Busan, Corea del Sur, y Tokio, Japón": "Animated globe with export routes from Monclova, Mexico, to Busan, South Korea, and Tokyo, Japan",
    "Oro": "Gold",
    "Plata": "Silver",
    "Platino": "Platinum",
    "Paladio": "Palladium",
    "Cifras clave de la compañía": "Key company figures",
    "Hectáreas en concesiones mineras": "Hectares in mining concessions",
    "mil+": "K+",
    "Toneladas de reservas minerales declaradas": "Tons of declared mineral reserves",
    "Toneladas al mes de explotación y exportación proyectadas": "Tons per month of projected mining and export",
    "Contrato de asociación renovable con empresa de Corea del Sur": "Renewable partnership agreement with a South Korean company",
    "años": "years",
    "Cifras declaradas por la compañía en su presentación ejecutiva de abril de 2026.": "Figures declared by the company in its April 2026 executive presentation.",
    "Un consorcio minero con base en Monclova.": "A mining consortium based in Monclova.",
    "Lance Internacional explota, concentra y comercializa minerales con contenido de metales preciosos, con equipo de campo y laboratorio de ensayos.": "Lance Internacional mines, concentrates and markets minerals containing precious metals, with field equipment and an assay laboratory.",
    "Minería": "Mining",
    "Exploración, explotación y concentración de minerales con oro, plata y platinoides.": "Exploration, mining and concentration of minerals containing gold, silver and platinum-group metals.",
    "Construcción": "Construction",
    "Caminos de acceso y aperturas de tiro para abrir frentes de trabajo en campo.": "Access roads and shaft openings to open up work fronts in the field.",
    "Comercialización": "Sales",
    "Exportación de concentrados y lingotes bullion hacia mercados de Corea y Japón.": "Export of concentrates and bullion ingots to the Korean and Japanese markets.",
    "Oficinas corporativas de Lance Internacional en Monclova, Coahuila, con jardín y acceso empedrado": "Lance Internacional corporate offices in Monclova, Coahuila, with a garden and cobblestone driveway",
    "Oficinas corporativas.": "Corporate offices.",
    "Letrero de la sede: Grupo ILT y Grupo Metals-Mex, con Lance Internacional, minería, construcción y comercialización": "Headquarters sign: Grupo ILT and Grupo Metals-Mex, with Lance Internacional, mining, construction and sales",
    "Operación en campo": "Field operations",
    "Obra y maquinaria donde empieza el mineral.": "Works and machinery where the ore begins.",
    "Frentes de trabajo en Coahuila, plantas de beneficio y equipo de trituración.": "Work fronts in Coahuila, beneficiation plants and crushing equipment.",
    "Proyectos Coahuila, sierra con concesiones": "Coahuila projects, mountain range with concessions",
    "Sierra de Coahuila con vegetación y caminos de acceso a las concesiones": "Coahuila mountain range with vegetation and access roads to the concessions",
    "Proyectos Coahuila": "Coahuila projects",
    "Sierra y caminos de acceso a las concesiones.": "Mountain range and access roads to the concessions.",
    "Apertura de tiros con excavadora": "Shaft opening with excavator",
    "Excavadora y personal en la apertura de un tiro sobre la ladera": "Excavator and crew opening a shaft on the hillside",
    "Apertura de tiros": "Shaft openings",
    "Excavación y obra sobre la ladera.": "Excavation and works on the hillside.",
    "Obra en caminos con cargador frontal": "Road works with front loader",
    "Cargador frontal sobre camino de roca triturada en zona minera": "Front loader on a crushed-rock road in a mining area",
    "Obra en caminos": "Road works",
    "Cargador frontal en zona de roca.": "Front loader on rocky ground.",
    "Planta clasificadora de mineral": "Ore sorting plant",
    "Planta clasificadora de mineral con bandas transportadoras y tolvas": "Ore sorting plant with conveyor belts and hoppers",
    "Planta clasificadora": "Sorting plant",
    "Tolvas y bandas para preparar el mineral.": "Hoppers and belts to prepare the ore.",
    "Trommel de lavado y clasificación": "Washing and sorting trommel",
    "Trommel de lavado y clasificación junto a una pila de material": "Washing and sorting trommel next to a pile of material",
    "Trommel de lavado": "Washing trommel",
    "Lavado y clasificación en sitio.": "On-site washing and sorting.",
    "Ocho metales preciosos bajo concesión.": "Eight precious metals under concession.",
    "Oro y plata, más seis platinoides de alto valor industrial: paladio, platino, iridio, rodio, rutenio y osmio.": "Gold and silver, plus six platinum-group metals of high industrial value: palladium, platinum, iridium, rhodium, ruthenium and osmium.",
    "Fragmentos de metal fundido con contenido de platinoides, muestra del concentrado Mulatos": "Fragments of smelted metal containing platinum-group metals, a sample of the Mulatos concentrate",
    "Muestra de metal fundido, concentrado Mulatos.": "Smelted metal sample, Mulatos concentrate.",
    "Metales presentes en las concesiones": "Metals present in the concessions",
    "Metal precioso": "Precious metal",
    "Platinoide": "PGM",
    "Iridio": "Iridium",
    "Rodio": "Rhodium",
    "Rutenio": "Ruthenium",
    "Osmio": "Osmium",
    "Resultados de laboratorio": "Laboratory results",
    "Ensayos de mena directa y de metal fundido, realizados por laboratorio certificado de Estados Unidos.": "Direct ore and smelted metal assays, performed by a certified laboratory in the United States.",
    "Muestras analizadas": "Analyzed samples",
    "Mena Mulatos": "Mulatos ore",
    "Mena directa, informe del 19/10/2023": "Direct ore, report dated Oct 19, 2023",
    "Lingote Busan": "Busan ingot",
    "Metal fundido en Corea del Sur": "Metal smelted in South Korea",
    "Concentrado El Gavilán": "El Gavilán concentrate",
    "Absorción atómica, ASTM E1024-84": "Atomic absorption, ASTM E1024-84",
    "Muestra de concentrado mineral en polvo con partículas metálicas brillantes": "Powdered mineral concentrate sample with bright metallic particles",
    "Concentrado mineral analizado.": "Mineral concentrate analyzed.",
    "Mena directa, mina Mulatos": "Direct ore, Mulatos mine",
    "Unidad:": "Unit:",
    "Valores tomados de informes de laboratorio de muestras puntuales. No representan la ley de la totalidad de las reservas.": "Values taken from laboratory reports of spot samples. They do not represent the grade of the full reserves.",
    "De la mina al lingote bullion.": "From the mine to the bullion ingot.",
    "Un proceso integrado que concentra el metal y lo funde con tecnología de plasma.": "An integrated process that concentrates the metal and smelts it with plasma technology.",
    "Frente de obra en Coahuila": "Work front in Coahuila",
    "Trituradora de quijadas": "Jaw crusher",
    "Antorcha de plasma transferido": "Transferred plasma torch",
    "Metal fundido enriquecido en platinoides": "Smelted metal enriched in platinum-group metals",
    "Análisis y pesaje en laboratorio": "Laboratory analysis and weighing",
    "Extracción y beneficio": "Extraction and beneficiation",
    "Explotación en mina y beneficio del mineral para obtener mena lista para molienda.": "Mining and beneficiation of the ore to obtain ore ready for grinding.",
    "Molienda y separación": "Grinding and separation",
    "Reducción de tamaño y separación para concentrar los metales de interés.": "Size reduction and separation to concentrate the metals of interest.",
    "Fundición por plasma": "Plasma smelting",
    "Operación a más de 1,200 °C, con recuperación superior a 95 % y sin residuos secundarios.": "Operation above 1,200 °C, with recovery above 95% and no secondary waste.",
    "Lingote enriquecido": "Enriched ingot",
    "Lingote metálico enriquecido en platinoides, destinado a venta en Corea y Japón.": "Metal ingot enriched in platinum-group metals, intended for sale in Korea and Japan.",
    "Refinación de oro, plata y platinoides": "Refining of gold, silver and platinum-group metals",
    "Siguiente fase: refinación química de oro y plata (pureza superior a 99.95 %) y electro-obtención de platinoides (superior a 99.9 %).": "Next phase: chemical refining of gold and silver (purity above 99.95%) and electrowinning of platinum-group metals (above 99.9%).",
    "Alianza estratégica": "Strategic alliance",
    "Tecnología de plasma desde Corea del Sur.": "Plasma technology from South Korea.",
    "Contrato de asociación por 5 años, renovable, con una empresa surcoreana. Cada socio aporta lo que mejor sabe hacer.": "Five-year renewable partnership agreement with a South Korean company. Each partner contributes what it does best.",
    "México": "Mexico",
    "Explotación de minas": "Mine operation",
    "Concentración del mineral": "Ore concentration",
    "Exportación de 250 t al mes": "Export of 250 t per month",
    "Corea del Sur": "South Korea",
    "Socio tecnológico": "Technology partner",
    "Tecnología y equipos especializados": "Specialized technology and equipment",
    "Fundición a lingotes tipo bullion": "Smelting into bullion-type ingots",
    "Venta en Corea y Japón": "Sales in Korea and Japan",
    "Plasma transferido frente a fundición convencional": "Transferred plasma vs. conventional smelting",
    "Antorcha de plasma": "Plasma torch",
    "Arco eléctrico convencional": "Conventional electric arc",
    "Vida útil del electrodo": "Electrode service life",
    "Más de 1,000 h": "More than 1,000 h",
    "Recuperación de metal": "Metal recovery",
    "95 % o más": "95% or more",
    "90 % o menos": "90% or less",
    "Eficiencia energética": "Energy efficiency",
    "80 % o más": "80% or more",
    "Alrededor de 70 %": "Around 70%",
    "Datos técnicos del socio tecnológico incluidos en la presentación ejecutiva de la compañía.": "Technical data from the technology partner, included in the company's executive presentation.",
    "Capacidad proyectada de la cadena completa.": "Projected capacity of the full chain.",
    "Del mineral concentrado en México al lingote exportado desde Corea del Sur.": "From concentrated ore in Mexico to ingots exported from South Korea.",
    "t/mes": "t/month",
    "Explotación y exportación": "Mining and export",
    "Lance explota, concentra y exporta el mineral.": "Lance mines, concentrates and exports the ore.",
    "t/día": "t/day",
    "Capacidad de fundición": "Smelting capacity",
    "Proceso y fundición en la planta del socio en Corea del Sur.": "Processing and smelting at the partner's plant in South Korea.",
    "Lingotes esperados": "Expected ingots",
    "Producción prevista de lingotes tipo bullion.": "Projected production of bullion-type ingots.",
    "a": "to",
    "M USD/mes": "M USD/month",
    "Ingreso proyectado": "Projected revenue",
    "Según las concentraciones logradas en México.": "Depending on the concentrations achieved in Mexico.",
    "La nueva planta de procesamiento iniciará producción en 6 meses.": "The new processing plant will begin production in 6 months.",
    "Proyecciones de la compañía, sujetas a las concentraciones obtenidas. No constituyen garantía de resultados ni oferta de inversión.": "Company projections, subject to the concentrations obtained. They do not constitute a guarantee of results or an investment offer.",
    "Equipo y laboratorio para respaldar cada decisión.": "Equipment and laboratory to support every decision.",
    "Planta de beneficio con tolvas, banda transportadora y cabina de control": "Beneficiation plant with hoppers, conveyor belt and control cabin",
    "Maquinaria de beneficio": "Beneficiation machinery",
    "Trituradoras de quijadas, tolvas, plantas clasificadoras y trommel para preparar el mineral antes de la fundición.": "Jaw crushers, hoppers, sorting plants and trommel to prepare the ore before smelting.",
    "Laboratorio de ensayos": "Assay laboratory",
    "Espectrómetro de absorción atómica, balanzas analíticas y material de vidrio para verificar el contenido de metales.": "Atomic absorption spectrometer, analytical balances and glassware to verify metal content.",
    "Espectrómetro de absorción atómica del laboratorio de ensayos": "Atomic absorption spectrometer in the assay laboratory",
    "Trituradora de quijadas pintada de gris en nave industrial": "Gray-painted jaw crusher in an industrial building",
    "Gobierno corporativo": "Corporate governance",
    "Estructura organizacional planeada.": "Planned organizational structure.",
    "Cuatro direcciones bajo la Dirección General, con áreas legales, técnicas y ambientales desde el inicio.": "Four divisions under the General Management, with legal, technical and environmental areas from the start.",
    "Dirección General": "General Management",
    "Asesores": "Advisors",
    "Contraloría": "Comptroller",
    "Dirección de Finanzas y Administración": "Finance and Administration Division",
    "Laboral": "Labor",
    "Fiscal": "Tax",
    "Dirección de Exploraciones": "Exploration Division",
    "Dirección Técnica": "Technical Division",
    "Tecnologías": "Technologies",
    "Laboratorios": "Laboratories",
    "Ecología y medio ambiente": "Ecology and environment",
    "Dirección de Operaciones": "Operations Division",
    "Procesos": "Processes",
    "Plantas": "Plants",
    "Equipos": "Equipment",
    "Mantenimientos": "Maintenance",
    "Preguntas frecuentes.": "Frequently asked questions.",
    "¿Qué metales contienen las concesiones?": "Which metals do the concessions contain?",
    "Según la presentación ejecutiva de la compañía, oro, plata y platinoides: paladio, platino, iridio, rodio, rutenio y osmio.": "According to the company's executive presentation, gold, silver and platinum-group metals: palladium, platinum, iridium, rhodium, ruthenium and osmium.",
    "¿Qué superficie y reservas declara Lance?": "What area and reserves does Lance declare?",
    "Concesiones en el norte de México con superficies del orden de 70 mil hectáreas y más de 500 millones de toneladas de reservas de minerales.": "Concessions in northern Mexico covering roughly 70 thousand hectares and more than 500 million tons of mineral reserves.",
    "¿Con quién se procesará el mineral?": "Who will process the ore?",
    "Con una empresa de Corea del Sur, bajo un contrato de asociación por 5 años, renovable. Aporta tecnología y equipos para fundir a lingotes bullion y venderlos en Corea y Japón.": "A South Korean company, under a five-year renewable partnership agreement. It provides the technology and equipment to smelt the ore into bullion ingots and sell them in Korea and Japan.",
    "¿Dónde están las oficinas?": "Where are the offices?",
    "Álamo 102, Col. Del Prado, C.P. 25730, Monclova, Coahuila, México.": "Álamo 102, Col. Del Prado, C.P. 25730, Monclova, Coahuila, Mexico.",
    "¿Cómo solicito una reunión?": "How do I request a meeting?",
    "Con el formulario de contacto (abre WhatsApp con su mensaje listo), llamando al (866) 633-5420 o 632-0237, o por correo a lance.internacional@gmail.com.": "Use the contact form (it opens WhatsApp with your message ready), call (866) 633-5420 or 632-0237, or email lance.internacional@gmail.com.",
    "Solicite una reunión con la dirección.": "Request a meeting with management.",
    "Cuéntenos si busca invertir, comprar concentrados o formar una alianza. Respondemos por WhatsApp.": "Tell us if you want to invest, buy concentrates or form an alliance. We reply on WhatsApp.",
    "Oficinas corporativas": "Corporate offices",
    "Teléfonos": "Phones",
    "(866) 633-5420 y 632-0237": "(866) 633-5420 and 632-0237",
    "Correo": "Email",
    "Sitio web": "Website",
    "Mapa de las oficinas de Lance Internacional en Monclova, Coahuila": "Map of the Lance Internacional offices in Monclova, Coahuila",
    "Escríbanos por WhatsApp": "Message us on WhatsApp",
    "Complete los datos y se abrirá la conversación con su mensaje listo.": "Fill in the details and the conversation will open with your message ready.",
    "Nombre completo": "Full name",
    "Ej. María Fernanda López": "E.g. Jane Smith",
    "(opcional)": "(optional)",
    "Nombre de su empresa": "Your company name",
    "Teléfono o correo": "Phone or email",
    "55 1234 5678 o nombre@empresa.com": "555 123 4567 or name@company.com",
    "Motivo de contacto": "Reason for contact",
    "Inversión o alianza estratégica": "Investment or strategic alliance",
    "Compra de concentrados o lingotes": "Purchase of concentrates or ingots",
    "Servicios de minería y construcción": "Mining and construction services",
    "Otro tema": "Other",
    "Mensaje": "Message",
    "Cuéntenos brevemente qué necesita": "Briefly tell us what you need",
    "Enviar por WhatsApp": "Send via WhatsApp",
    "Sus datos solo se usan para atender su solicitud.": "Your information is only used to handle your request.",
    "Listo. Abrimos WhatsApp con su mensaje. Si no se abrió,": "Done. We opened WhatsApp with your message. If it did not open,",
    "inténtelo de nuevo": "try again",
    "Lance Internacional, consorcio minero": "Lance Internacional, mining consortium",
    "Consorcio minero con concesiones de oro, plata y platinoides en el norte de México.": "Mining consortium with gold, silver and platinum-group metal concessions in northern Mexico.",
    "Pie de página": "Footer",
    "Navegación": "Navigation",
    "Metales y ensayos": "Metals and assays",
    "Preguntas frecuentes": "FAQ",
    "Empresa Socialmente Responsable": "Empresa Socialmente Responsable (Socially Responsible Company)",
    "Lance Internacional, S.A. de C.V. Todos los derechos reservados.": "Lance Internacional, S.A. de C.V. All rights reserved.",
    "La información de reservas, capacidades e ingresos corresponde a declaraciones y proyecciones de la compañía y puede cambiar. Este sitio no constituye oferta de inversión.": "Information on reserves, capacities and revenue corresponds to company statements and projections and may change. This site does not constitute an investment offer.",
    "Escribir por WhatsApp a Lance Internacional": "Message Lance Internacional on WhatsApp",
    "¿Hablamos por WhatsApp?": "Chat with us on WhatsApp",
    "Idioma": "Language"
  };

  const root = document.documentElement;
  const STORE = 'lance-lang';
  const HTML_LANG = { es: 'es-MX', en: 'en' };
  const ATTRS = ['alt', 'aria-label', 'placeholder', 'title'];
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT']);
  // Zonas que arma script.js palabra por palabra o con datos propios: las traduce él.
  const SKIP = '[data-split], #assayGrid, [data-assay-title], #menuBtn';

  const TO_EN = new Map(Object.entries(DICT));
  const TO_ES = new Map(Object.entries(DICT).map(([es, en]) => [en, es]));
  const collapse = (s) => s.replace(/\s+/g, ' ');

  const current = () => (root.lang.toLowerCase().startsWith('en') ? 'en' : 'es');

  /* Traduce una cadena al idioma `to`, respetando los espacios de los bordes.
     Si el texto no está en el diccionario, se devuelve igual. */
  function tr(str, to = current()) {
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(str);
    const out = (to === 'en' ? TO_EN : TO_ES).get(collapse(m[2]));
    return out === undefined ? str : m[1] + out + m[3];
  }

  function translateDom(to) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const p = n.parentElement;
      if (!p || SKIP_TAGS.has(p.tagName) || p.closest(SKIP)) continue;
      const v = tr(n.nodeValue, to);
      if (v !== n.nodeValue) n.nodeValue = v;
    }
    document.querySelectorAll(ATTRS.map((a) => `[${a}]`).join(',')).forEach((el) => {
      if (el.closest(SKIP)) return;
      ATTRS.forEach((a) => {
        const cur = el.getAttribute(a);
        if (!cur) return;
        const v = tr(cur, to);
        if (v !== cur) el.setAttribute(a, v);
      });
    });
    document.title = tr(document.title, to);
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', tr(desc.getAttribute('content') || '', to));
  }

  function setLang(to, save = true) {
    to = to === 'en' ? 'en' : 'es';
    const changed = to !== current();
    root.lang = HTML_LANG[to];
    if (changed) translateDom(to);
    document.querySelectorAll('[data-set-lang]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.setLang === to));
    });
    if (save) { try { localStorage.setItem(STORE, to); } catch (_) { /* noop */ } }
    if (changed) document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: to } }));
  }

  window.LanceI18n = {
    get lang() { return current(); },
    tr: (s) => tr(s),
    set: setLang,
  };

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-set-lang]');
    if (b) setLang(b.dataset.setLang);
  });

  let saved = null;
  try { saved = localStorage.getItem(STORE); } catch (_) { /* noop */ }
  setLang(saved === 'en' ? 'en' : 'es', false);
})();
