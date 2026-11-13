export const PELVI_EVAL_V3_PRESET = {
  "code": "PELVI_EVAL_V3",
  "icon": "fa-person-breastfeeding",
  "name": "Fisioterapia & Rehabilitación de Piso Pélvico",
  "stages": [
    {
      "id": "stage_anamnesis",
      "title": "Anamnesis & Tests Validados",
      "sections": [
        {
          "id": "sec_patient_core",
          "icon": "fa-user-circle",
          "title": "Filiación & Motivo Principal de Consulta",
          "fields": [
            {
              "id": "biological_sex",
              "type": "select",
              "label": "Sexo Biológico",
              "options": [
                {
                  "label": "Femenino (Perfil Gineco-Obstétrico)",
                  "value": "femenino"
                },
                {
                  "label": "Masculino (Perfil Urológico / Andrológico)",
                  "value": "masculino"
                }
              ],
              "defaultValue": "femenino"
            },
            {
              "id": "consult_reason",
              "type": "text",
              "label": "Motivo Principal de Consulta",
              "placeholder": "Ej: Pérdidas involuntarias de orina al toser...",
              "defaultValue": "Incontinencia urinaria de esfuerzo en el postparto."
            },
            {
              "id": "consult_job",
              "type": "text",
              "label": "Ocupación & Carga Física",
              "placeholder": "Ej: Docente, bipedestación prolongada...",
              "defaultValue": "Docente (bipedestación prolongada > 5h/día, esfuerzos vocales)."
            },
            {
              "id": "consult_goal",
              "type": "text",
              "label": "Expectativa / Objetivo del Paciente",
              "placeholder": "Ej: Retomar actividad deportiva sin escapes...",
              "defaultValue": "Retomar actividad física y deportiva sin escapes involuntarios."
            }
          ],
          "columns": 4
        },
        {
          "id": "sec_preexisting",
          "icon": "fa-notes-medical",
          "title": "Comorbilidades & Factores de Riesgo Sistémicos",
          "fields": [
            {
              "id": "chk_diabetes",
              "type": "checkbox",
              "label": "Diabetes Mellitus (I / II / Gestacional)",
              "defaultValue": false
            },
            {
              "id": "chk_laxity",
              "type": "checkbox",
              "label": "Hiperlaxitud Articular (Beighton ≥ 4)",
              "defaultValue": true
            },
            {
              "id": "chk_obesity",
              "type": "checkbox",
              "label": "Sobrepeso / Obesidad (IMC > 27)",
              "defaultValue": true
            },
            {
              "id": "chk_respiratory",
              "type": "checkbox",
              "label": "Asma / Tos Crónica de esfuerzo",
              "defaultValue": false
            },
            {
              "id": "chk_spine",
              "type": "checkbox",
              "label": "Lumbopelvialgia / Hernia Discal previa",
              "defaultValue": true
            },
            {
              "id": "patient_meds",
              "type": "text",
              "label": "Fármacos con impacto en detrusor/colágeno",
              "defaultValue": "Levotiroxina 50mcg. Sin diuréticos."
            }
          ],
          "columns": 3
        },
        {
          "id": "sec_female_obs",
          "icon": "fa-baby",
          "title": "Rama Obstétrica Femenina",
          "fields": [
            {
              "id": "obstetricPhase",
              "type": "select",
              "label": "Fase Obstétrica Actual",
              "options": [
                {
                  "label": "Postparto / Puerperio",
                  "value": "postparto"
                },
                {
                  "label": "Preparación al Parto (Preparto)",
                  "value": "preparto"
                },
                {
                  "label": "Ginecología General / Menopausia / No aplica",
                  "value": "no_aplica"
                }
              ],
              "defaultValue": "postparto"
            },
            {
              "id": "obs_parity",
              "type": "number",
              "label": "Partos Vaginales",
              "defaultValue": 1
            },
            {
              "id": "obs_cesarean",
              "type": "number",
              "label": "Cesáreas",
              "defaultValue": 0
            },
            {
              "id": "obs_tear",
              "type": "select",
              "label": "Trauma Perineal Previo",
              "options": [
                {
                  "label": "Episiotomía M-L",
                  "value": "episiotomy"
                },
                {
                  "label": "Desgarro Grado I / II",
                  "value": "tear_1_2"
                },
                {
                  "label": "Desgarro Grave III/IV (OASIS)",
                  "value": "oasis"
                },
                {
                  "label": "Periné Íntegro",
                  "value": "intact"
                }
              ],
              "defaultValue": "episiotomy"
            }
          ],
          "columns": 4,
          "condition": {
            "field": "biological_sex",
            "value": "femenino",
            "operator": "eq"
          }
        },
        {
          "id": "sec_male_urology",
          "icon": "fa-mars",
          "title": "Rama Urológica Masculina",
          "fields": [
            {
              "id": "male_surgery",
              "type": "select",
              "label": "Cirugía Prostática Previa",
              "options": [
                {
                  "label": "Prostatectomía Radical (da Vinci / Robótica)",
                  "value": "robotic"
                },
                {
                  "label": "Prostatectomía Abierta",
                  "value": "open"
                },
                {
                  "label": "RTU / Enucleación Láser HoLEP",
                  "value": "rtu"
                },
                {
                  "label": "Sin Cirugía (Vejiga hiperactiva / Dolor)",
                  "value": "none"
                }
              ],
              "defaultValue": "robotic"
            },
            {
              "id": "pad_test_24h",
              "type": "number",
              "label": "Pad Test 24 Horas (Gramos de pérdida)",
              "defaultValue": 85
            },
            {
              "id": "nih_cpsi_score",
              "type": "number",
              "label": "Score Dolor/Molestia NIH-CPSI (0-43)",
              "defaultValue": 14
            }
          ],
          "columns": 3,
          "condition": {
            "field": "biological_sex",
            "value": "masculino",
            "operator": "eq"
          }
        },
        {
          "id": "sec_iciq",
          "icon": "fa-square-poll-vertical",
          "type": "score_card",
          "title": "Cuestionario Validado ICIQ-UI SF",
          "fields": [
            {
              "id": "iciq_freq",
              "type": "radio",
              "label": "1. ¿Con qué frecuencia pierde orina?",
              "options": [
                {
                  "label": "Nunca (0)",
                  "value": 0
                },
                {
                  "label": "1 vez a la semana o menos (1)",
                  "value": 1
                },
                {
                  "label": "2 o 3 veces a la semana (2)",
                  "value": 2
                },
                {
                  "label": "1 vez al día (3)",
                  "value": 3
                },
                {
                  "label": "Varias veces al día (4)",
                  "value": 4
                },
                {
                  "label": "Continuamente (5)",
                  "value": 5
                }
              ],
              "defaultValue": 2
            },
            {
              "id": "iciq_vol",
              "type": "radio",
              "label": "2. ¿Qué cantidad de orina pierde habitualmente?",
              "options": [
                {
                  "label": "No pierde nada (0)",
                  "value": 0
                },
                {
                  "label": "Cantidad pequeña / gotas (2)",
                  "value": 2
                },
                {
                  "label": "Cantidad moderada (4)",
                  "value": 4
                },
                {
                  "label": "Mucha cantidad / empapa ropa (6)",
                  "value": 6
                }
              ],
              "defaultValue": 2
            },
            {
              "id": "iciq_impact",
              "max": 10,
              "min": 0,
              "type": "range",
              "label": "3. Impacto en su vida cotidiana (0 a 10)",
              "defaultValue": 7
            }
          ],
          "columns": 3,
          "scoreId": "iciq_score",
          "maxScore": 21,
          "scoreName": "Score ICIQ-UI SF",
          "severityCalculation": {
            "scale": [
              {
                "max": 0,
                "label": "Sin Incontinencia",
                "badgeClass": "bg-emerald-100 text-emerald-700"
              },
              {
                "max": 5,
                "label": "Impacto Leve",
                "badgeClass": "bg-teal-100 text-teal-700"
              },
              {
                "max": 12,
                "label": "Impacto Moderado",
                "badgeClass": "bg-blue-100 text-blue-700"
              },
              {
                "max": 18,
                "label": "Impacto Severo",
                "badgeClass": "bg-amber-100 text-amber-700"
              },
              {
                "max": 21,
                "label": "Impacto Muy Severo",
                "badgeClass": "bg-rose-100 text-rose-700"
              }
            ]
          }
        },
        {
          "id": "sec_bristol_bowel",
          "icon": "fa-apple-whole",
          "title": "Función Intestinal & Escala de Bristol",
          "fields": [
            {
              "id": "bristol_scale",
              "type": "visual_bristol",
              "label": "Tipo en la Escala Visual de Bristol",
              "options": [
                {
                  "desc": "Bolas duras separadas (nuez)",
                  "type": 1,
                  "badge": "Estreñimiento Severo",
                  "emoji": "🌰",
                  "title": "Tipo 1",
                  "badgeClass": "text-rose-600 dark:text-rose-400"
                },
                {
                  "desc": "Salchicha grumosa apelmazada",
                  "type": 2,
                  "badge": "Estreñimiento Leve",
                  "emoji": "🥔",
                  "title": "Tipo 2",
                  "badgeClass": "text-amber-600 dark:text-amber-400"
                },
                {
                  "desc": "Salchicha con grietas",
                  "type": 3,
                  "badge": "Normal / Aceptable",
                  "emoji": "🥖",
                  "title": "Tipo 3",
                  "badgeClass": "text-emerald-600 dark:text-emerald-400"
                },
                {
                  "desc": "Salchicha suave y lisa",
                  "type": 4,
                  "badge": "Ideal / Óptimo",
                  "emoji": "🐍",
                  "title": "Tipo 4",
                  "badgeClass": "text-emerald-600 dark:text-emerald-400"
                },
                {
                  "desc": "Trozos blandos con bordes claros",
                  "type": 5,
                  "badge": "Falta de fibra",
                  "emoji": "🥟",
                  "title": "Tipo 5",
                  "badgeClass": "text-slate-400 dark:text-slate-500"
                },
                {
                  "desc": "Fragmentos pastosos deshechos",
                  "type": 6,
                  "badge": "Diarrea Ligera",
                  "emoji": "🥣",
                  "title": "Tipo 6",
                  "badgeClass": "text-amber-600 dark:text-amber-400"
                },
                {
                  "desc": "Totalmente líquida sin sólidos",
                  "type": 7,
                  "badge": "Diarrea Severa",
                  "emoji": "🌊",
                  "title": "Tipo 7",
                  "badgeClass": "text-rose-600 dark:text-rose-400"
                }
              ],
              "defaultValue": 2
            },
            {
              "id": "constipation_straining",
              "type": "select",
              "label": "Esfuerzo defecatorio excesivo (>25% tiempo)",
              "options": [
                {
                  "label": "Sí (Pujo intenso habitual)",
                  "value": "yes"
                },
                {
                  "label": "No (Evacuación fisiológica sin esfuerzo)",
                  "value": "no"
                }
              ],
              "defaultValue": "yes"
            }
          ],
          "columns": 2
        },
        {
          "id": "sec_bladder_diary",
          "icon": "fa-glass-water-droplet",
          "type": "table_dynamic",
          "title": "Diario Miccional Registrado (Balance Hídrico)",
          "columns": [
            {
              "key": "time",
              "type": "text",
              "label": "Hora"
            },
            {
              "key": "intakeVol",
              "type": "number",
              "label": "Ingesta (ml)"
            },
            {
              "key": "intakeType",
              "type": "text",
              "label": "Tipo de Bebida"
            },
            {
              "key": "voidVol",
              "type": "number",
              "label": "Diuresis / Volumen (ml)"
            },
            {
              "key": "urgency",
              "type": "text",
              "label": "Urgencia (0 a 3)"
            },
            {
              "key": "leak",
              "type": "checkbox",
              "label": "¿Escape involuntario?"
            },
            {
              "key": "activity",
              "type": "text",
              "label": "Actividad al escape"
            }
          ],
          "defaultRows": [
            {
              "leak": false,
              "time": "07:30",
              "urgency": "0 (Sin urgencia)",
              "voidVol": 350,
              "activity": "Reposo al despertar",
              "intakeVol": 300,
              "intakeType": "Café con leche"
            },
            {
              "leak": true,
              "time": "11:15",
              "urgency": "1 (Leve)",
              "voidVol": 200,
              "activity": "Subiendo escaleras",
              "intakeVol": 500,
              "intakeType": "Agua mineral"
            },
            {
              "leak": true,
              "time": "15:45",
              "urgency": "2 (Moderada)",
              "voidVol": 250,
              "activity": "Tos repetida",
              "intakeVol": 450,
              "intakeType": "Infusión / Té verde"
            },
            {
              "leak": true,
              "time": "19:30",
              "urgency": "1 (Leve)",
              "voidVol": 300,
              "activity": "Cargando compras",
              "intakeVol": 700,
              "intakeType": "Agua con limón"
            }
          ]
        },
        {
          "id": "sec_consent_upload",
          "icon": "fa-file-signature",
          "type": "file_attachment",
          "title": "Consentimiento Informado & Archivos Adjuntos",
          "fields": [
            {
              "id": "consentStatus",
              "type": "select",
              "label": "Estado Médico-Legal",
              "options": [
                {
                  "label": "Firmado en consulta presencial",
                  "value": "signed"
                },
                {
                  "label": "Firma digital verificada",
                  "value": "digital"
                },
                {
                  "label": "Pendiente de firma",
                  "value": "pending"
                },
                {
                  "label": "Revocado / No autorizado",
                  "value": "revoked"
                }
              ],
              "defaultValue": "signed"
            },
            {
              "id": "consent_date",
              "type": "date",
              "label": "Fecha de Firma",
              "defaultValue": "2026-10-22"
            }
          ],
          "legalScope": "Autorización para palpación intracavitaria, biofeedback y electroestimulación."
        }
      ],
      "stepNumber": 1,
      "description": "Comorbilidades, cuestionarios validados (ICIQ-UI SF, Bristol), diario miccional y consentimiento informado."
    },
    {
      "id": "stage_exam",
      "title": "Examen Físico Funcional & Perineal",
      "sections": [
        {
          "id": "sec_abdomino_pelvic",
          "icon": "fa-child-reaching",
          "title": "Evaluación Abdominopélvica & Sinergia Diafragmática",
          "fields": [
            {
              "id": "diastasis_supra",
              "step": "0.1",
              "type": "number",
              "label": "Diástasis Supraumbilical (cm)",
              "defaultValue": 2.5
            },
            {
              "id": "diastasis_umbilical",
              "step": "0.1",
              "type": "number",
              "label": "Diástasis Umbilical (cm)",
              "defaultValue": 2
            },
            {
              "id": "diastasis_infra",
              "step": "0.1",
              "type": "number",
              "label": "Diástasis Infraumbilical (cm)",
              "defaultValue": 1.2
            },
            {
              "id": "valsalva_response",
              "type": "select",
              "label": "Respuesta al Esfuerzo / Maniobra de Valsalva",
              "options": [
                {
                  "label": "Incompetente (abombamiento perineal y escape)",
                  "value": "incompetent"
                },
                {
                  "label": "Competente (pre-contracción refleja / The Knack)",
                  "value": "competent"
                },
                {
                  "label": "Inversión de comando motor",
                  "value": "inverted"
                }
              ],
              "defaultValue": "incompetent"
            }
          ],
          "columns": 4
        },
        {
          "id": "sec_oxford_scale",
          "icon": "fa-hand-dots",
          "title": "Fuerza Muscular del Suelo Pélvico (Escala de Oxford Modificada)",
          "fields": [
            {
              "id": "oxfordGrade",
              "type": "select",
              "label": "Grado Oxford Basal",
              "options": [
                {
                  "label": "Grado 0: Sin contracción perceptible",
                  "value": 0
                },
                {
                  "label": "Grado 1: Fasciculación / Contracción débil",
                  "value": 1
                },
                {
                  "label": "Grado 2: Contracción débil sin elevación",
                  "value": 2
                },
                {
                  "label": "Grado 3: Contracción moderada con elevación",
                  "value": 3
                },
                {
                  "label": "Grado 4: Contracción buena contra resistencia",
                  "value": 4
                },
                {
                  "label": "Grado 5: Contracción fuerte y sostenida",
                  "value": 5
                }
              ],
              "defaultValue": 3
            }
          ],
          "columns": 1
        },
        {
          "id": "sec_perfect_scheme",
          "icon": "fa-hand-holding-medical",
          "type": "score_card",
          "title": "Palpación Intracavitaria: Esquema PERFECT (Laycock)",
          "fields": [
            {
              "id": "perfect_p",
              "key": "power",
              "max": 5,
              "min": 0,
              "type": "number",
              "label": "P - Power (Escala Oxford 0-5)",
              "defaultValue": 3
            },
            {
              "id": "perfect_e",
              "key": "endurance",
              "max": 10,
              "min": 0,
              "type": "number",
              "label": "E - Endurance (Resistencia en segundos)",
              "defaultValue": 6
            },
            {
              "id": "perfect_r",
              "key": "repetitions",
              "max": 10,
              "min": 0,
              "type": "number",
              "label": "R - Repetitions (Repeticiones mantenidas)",
              "defaultValue": 4
            },
            {
              "id": "perfect_f",
              "key": "fast",
              "max": 10,
              "min": 0,
              "type": "number",
              "label": "F - Fast (Contracciones rápidas de 1s)",
              "defaultValue": 5
            }
          ],
          "columns": 4,
          "scoreId": "perfect_power",
          "maxScore": 5,
          "scoreName": "Power Oxford Basal"
        },
        {
          "id": "sec_popq",
          "icon": "fa-layer-group",
          "title": "Estadificación de Prolapso (POP-Q Simplificado)",
          "fields": [
            {
              "id": "popq_anterior",
              "type": "select",
              "label": "Pared Anterior (Cistocele)",
              "options": [
                {
                  "label": "Estadio 0 (Sin descenso)",
                  "value": "0"
                },
                {
                  "label": "Estadio I (>1 cm sobre himen)",
                  "value": "I"
                },
                {
                  "label": "Estadio II (a nivel del himen ±1cm)",
                  "value": "II"
                },
                {
                  "label": "Estadio III (exteriorizado >1cm)",
                  "value": "III"
                }
              ],
              "defaultValue": "I"
            },
            {
              "id": "popq_apical",
              "type": "select",
              "label": "Compartimento Apical (Útero/Cúpula)",
              "options": [
                {
                  "label": "Estadio 0 (Normal)",
                  "value": "0"
                },
                {
                  "label": "Estadio I",
                  "value": "I"
                },
                {
                  "label": "Estadio II",
                  "value": "II"
                }
              ],
              "defaultValue": "0"
            },
            {
              "id": "popq_posterior",
              "type": "select",
              "label": "Pared Posterior (Rectocele)",
              "options": [
                {
                  "label": "Estadio 0 (Normal)",
                  "value": "0"
                },
                {
                  "label": "Estadio I (Descenso leve)",
                  "value": "I"
                },
                {
                  "label": "Estadio II",
                  "value": "II"
                }
              ],
              "defaultValue": "I"
            }
          ],
          "columns": 3
        },
        {
          "id": "sec_3d_anatomy",
          "icon": "fa-cubes",
          "type": "anatomy_3d_viewer",
          "title": "Visor 3D Anatómico Interactivo & Cartografía Perineal",
          "config": {
            "camera": {
              "fov": 45,
              "target": {
                "x": 0,
                "y": 0,
                "z": 0
              },
              "position": {
                "x": 0,
                "y": 0.3,
                "z": 2.2
              }
            },
            "modelUrl": "/assets/models/body_human.glb",
            "structures": [
              {
                "label": "M. Pubococcígeo Izquierdo",
                "meshId": "Pubococcygeus muscle.l",
                "evalType": "OXFORD"
              },
              {
                "label": "M. Pubococcígeo Derecho",
                "meshId": "Pubococcygeus muscle.r",
                "evalType": "OXFORD"
              },
              {
                "label": "M. Iliococcígeo Izquierdo",
                "meshId": "Iliococcygeus muscle.l",
                "evalType": "OXFORD"
              },
              {
                "label": "M. Iliococcígeo Derecho",
                "meshId": "Iliococcygeus muscle.r",
                "evalType": "OXFORD"
              },
              {
                "label": "M. Puborrectal (Cincha Urogenital)",
                "meshId": "Puborectalis muscle",
                "evalType": "OXFORD"
              },
              {
                "label": "Esfínter Uretra / Compresor Uretral",
                "meshId": "Urethral sphincter",
                "evalType": "OXFORD"
              }
            ],
            "specialtyCode": "PELVIC_FLOOR"
          }
        }
      ],
      "stepNumber": 2,
      "description": "Evaluación abdominopélvica, esquema PERFECT (Laycock), diástasis y visor 3D anatómico."
    },
    {
      "id": "stage_treatment",
      "title": "Plan de Tratamiento & Modalidades",
      "sections": [
        {
          "id": "sec_modalities",
          "icon": "fa-wand-magic-sparkles",
          "type": "treatment_builder",
          "title": "Modalidades Terapéuticas Estandarizadas",
          "standardOptions": [
            {
              "id": "kegel",
              "code": "kegel",
              "kind": "STANDARD_MODALITY",
              "name": "Cinesiterapia del Suelo Pélvico (Kegel)",
              "fields": [
                {
                  "key": "kegelContract",
                  "type": "number",
                  "label": "Contracción (s)",
                  "defaultValue": 5
                },
                {
                  "key": "kegelRest",
                  "type": "number",
                  "label": "Reposo (s)",
                  "defaultValue": 10
                },
                {
                  "key": "kegelSets",
                  "type": "number",
                  "label": "Series al día",
                  "defaultValue": 3
                }
              ],
              "checked": true,
              "category": "Cinesiterapia",
              "frequency": "Diario"
            },
            {
              "id": "electro",
              "code": "electro",
              "kind": "STANDARD_MODALITY",
              "name": "Electroestimulación Uroginecológica",
              "fields": [
                {
                  "key": "electroHz",
                  "type": "number",
                  "label": "Frecuencia (Hz)",
                  "defaultValue": 35
                },
                {
                  "key": "electroUs",
                  "type": "number",
                  "label": "Ancho de Pulso (µs)",
                  "defaultValue": 250
                },
                {
                  "key": "electroMin",
                  "type": "number",
                  "label": "Duración (min)",
                  "defaultValue": 20
                }
              ],
              "checked": true,
              "category": "Electroterapia",
              "frequency": "2 a 3 sesiones/semana"
            },
            {
              "id": "biofeedback",
              "code": "biofeedback",
              "kind": "STANDARD_MODALITY",
              "name": "Biofeedback EMG de Piso Pélvico",
              "checked": true,
              "category": "Biofeedback",
              "frequency": "1 a 2 sesiones/semana",
              "dosageParameters": "EMG intracavitario / Objetivo reposo ≤ 2µV, pico contracción ≥ 18µV"
            },
            {
              "id": "home_kegel",
              "code": "home_kegel",
              "kind": "STANDARD_MODALITY",
              "name": "Pauta Domiciliaria / Conos Vaginales",
              "checked": true,
              "category": "Domiciliario",
              "frequency": "Diario en domicilio",
              "dosageParameters": "Cono vaginal #2 (35g) 10 min en bipedestación activa"
            }
          ],
          "customTreatmentsDefault": [
            {
              "id": "tx-1",
              "goal": "Incrementar viscoelasticidad, elastina y desensibilizar foco de fibrosis doloroso.",
              "zone": "Cicatriz de episiotomía y ligamento sacroespinoso",
              "title": "Diatermia profunda / Radiofrecuencia (Tecarterapia pelviana)",
              "category": "Tecnología Electrofísica / Diatermia",
              "homeCare": "Evitar esfuerzos con Valsalva 24h posteriores.",
              "frequency": "1 sesión por semana (4 sesiones totales)",
              "technique": "Radiofrecuencia capacitiva y resistiva intracavitaria",
              "parameters": "448 kHz, Modo Capacitivo 40% (10m) + Resistivo 30% (8m)"
            }
          ]
        }
      ],
      "stepNumber": 3,
      "description": "Prescripciones estandarizadas (Kegel, electro, biofeedback) y constructor de modalidades ad-hoc."
    },
    {
      "id": "stage_evolution",
      "title": "Evolución, SOAP & Analítica Visual",
      "sections": [
        {
          "id": "sec_soap",
          "icon": "fa-clipboard-check",
          "title": "Evolución Clínica Estructurada (Estándar SOAP)",
          "fields": [
            {
              "id": "soap_s",
              "type": "textarea",
              "label": "S - Subjetivo (Sensaciones y reporte semanal del paciente)",
              "defaultValue": "Paciente refiere franca mejoría. Solo 1 escape leve al estornudar fuerte. Sin pesadez ni dolor perineal."
            },
            {
              "id": "soap_o",
              "type": "textarea",
              "label": "O - Objetivo (Reevaluación PERFECT, Biofeedback & Diástasis)",
              "defaultValue": "Oxford Grado 3 (+1 respecto al basal). Sostiene 7 segundos continuos. Diástasis supraumbilical se reduce a 2.1 cm."
            },
            {
              "id": "soap_a",
              "type": "textarea",
              "label": "A - Análisis / Apreciación Diagnóstica",
              "defaultValue": "Evolución favorable. Reducción clínica del 65% en severidad de IUE. Cicatriz perineal eutrófica e indolora."
            },
            {
              "id": "soap_p",
              "type": "textarea",
              "label": "P - Plan / Progresión de Cargas & Próxima Cita",
              "defaultValue": "Progresar contracciones en bipedestación activa con impacto leve. Añadir cono vaginal #3 (50g). Cita en 7 días."
            }
          ],
          "columns": 2
        },
        {
          "id": "sec_charts",
          "icon": "fa-chart-pie",
          "type": "charts_dashboard",
          "title": "Gráficos Biomecánicos & Curvas de Recuperación",
          "charts": [
            {
              "id": "radar_perfect",
              "type": "radar",
              "title": "Radar Biomecánico PERFECT (Basal vs Actual)",
              "scaleMax": 10,
              "scaleMin": 0,
              "dimensions": [
                "Power (Fuerza)",
                "Endurance (Resistencia)",
                "Repetitions (Repeticiones)",
                "Fast (Rápidas)",
                "Elevación Refleja"
              ]
            },
            {
              "id": "line_iciq",
              "type": "line",
              "title": "Curva de Descenso ICIQ-UI SF (0 a 21)",
              "scaleMax": 21,
              "scaleMin": 0,
              "timeline": [
                "Semana 0",
                "Semana 2",
                "Semana 4",
                "Semana 6 (Actual)"
              ]
            }
          ]
        }
      ],
      "stepNumber": 4,
      "description": "Notas SOAP estructuradas, radar biomecánico y curva de descenso ICIQ-UI SF."
    }
  ],
  "version": "2.4.0",
  "specialty": "Uroginecología, Urología & Coloproctología",
  "templateId": "tpl_pelvic_floor_v3",
  "description": "Plantilla clínica integral de Piso Pélvico con anamnesis obstétrica/urológica, ICIQ-UI SF, Bristol, diario miccional, esquema PERFECT, visor 3D anatómico, modalidades de tratamiento y curvas evolutivas."
} as any;
