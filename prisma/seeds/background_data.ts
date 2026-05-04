// prisma/seeds/background_data.ts — US-91/92/102
// Adds roleplay_data, starting_equipment, feature name/description to each Background

import type { PrismaClient } from '@prisma/client';

type BgData = {
  name: string;
  feature_name: string;
  feature_description: string;
  roleplay_data: {
    personality_traits: string[];
    bonds: string[];
    ideals: string[];
    flaws: string[];
  };
  starting_equipment: { item_name: string; quantity: number }[];
};

const BACKGROUNDS: BgData[] = [
  {
    name: 'Acolyte',
    feature_name: 'Shelter of the Faithful',
    feature_description: 'You command the respect of those who share your faith. You and your companions can receive free healing at temples of your deity, and you have ties to a specific temple where you can call for aid.',
    roleplay_data: {
      personality_traits: [
        'Idolizo a un héroe de mi fe y menciono constantemente sus hazañas.',
        'Puedo encontrar terreno común entre los enemigos más acérrimos, empatizando con ellos.',
        'Veo presagios en todo y alerto a otros sobre posibles signos de los dioses.',
        'Nada puede sacudir mi actitud optimista.',
        'Cito las escrituras sagradas en casi cualquier situación.',
        'Soy tolerante con otras fes y respeto la adoración de otros dioses.',
        'He disfrutado de comida y alojamiento finos, y es difícil para mí disfrutar de menos.',
        'Me siento desvinculado de quienes no comparten mi devoción.'
      ],
      ideals: [
        'Tradición. Las antiguas tradiciones deben preservarse y mantenerse.',
        'Caridad. Siempre ayudo a quienes están en necesidad, cueste lo que cueste.',
        'Cambio. Los viejos caminos deben abrirse paso a nuevos.',
        'Poder. Espero que un día pueda hacer las decisiones importantes.',
        'Fe. Confío en que mi deidad me guiará en cualquier situación difícil.',
        'Aspiración. Aspiro a probar que soy digno de la gracia de mi dios haciendo buenas obras.'
      ],
      bonds: [
        'Daría mi vida por recuperar una reliquia sagrada que fue robada a mi templo.',
        'Algún día me vengaré de la jerarquía corrupta del templo que me declaró hereje.',
        'Le debo mi vida al sacerdote que me acogió cuando mis padres murieron.',
        'Todo lo que hago es por el pueblo común.',
        'Haré lo que sea para proteger el templo donde serví.',
        'Busco preservar un texto sagrado que mis enemigos consideran herético.'
      ],
      flaws: [
        'Juzgo duramente a quienes no comparten los ideales de mi templo.',
        'Soy inflexiblemente mojigato en mi perspectiva.',
        'Soy suspicaz con los extraños y espero lo peor de ellos.',
        'Una vez que me pongo en una meta, me obsesiono con ella ignorando todo lo demás.',
        'El placer mundano es difícil para mí resistirlo.',
        'Soy deshonesto cuando no puedo llegar a mis objetivos por medios directos.'
      ]
    },
    starting_equipment: [
      { item_name: 'Holy Symbol', quantity: 1 },
      { item_name: 'Prayer Book', quantity: 1 },
      { item_name: 'Incense', quantity: 5 },
      { item_name: 'Vestments', quantity: 1 },
      { item_name: 'Common Clothes', quantity: 1 },
    ]
  },
  {
    name: 'Criminal',
    feature_name: 'Criminal Contact',
    feature_description: 'You have a reliable and trustworthy contact who acts as your liaison to a network of criminals. You can relay messages through this contact and have access to the criminal underground.',
    roleplay_data: {
      personality_traits: [
        'Siempre tengo un plan para cuando las cosas salen mal.',
        'Siempre soy tranquilo, no importa la situación.',
        'La primera cosa que hago en un lugar nuevo es notar las salidas.',
        'Prefiero hacer nuevos amigos a hacer nuevos enemigos.',
        'Soy increíblemente lento para confiar. Quienes parecen más amables suelen tener algo que ocultar.',
        'No me preocupo por quienes no puedo ayudar a ayudarse a sí mismos.',
        'Soy extremadamente paciente y esperaré el tiempo necesario para obtener lo que quiero.',
        'Ignoro la amenaza que suponen quienes olvidan los riesgos del pasado.'
      ],
      ideals: [
        'Honor. No robo a los pobres ni a los que menos tienen.',
        'Libertad. Las cadenas deben romperse, así como los que las forjan.',
        'Caridad. Robo a los que causan daño a los demás.',
        'Creatividad. No me limito a robar; lo hago con estilo y arte.',
        'Pueblo. Soy leal a mis amigos, no a ningún ideal.',
        'Redención. Hay una chispa de bondad en todos nosotros.'
      ],
      bonds: [
        'Estoy tratando de pagar una deuda que le debo a un benefactor generoso.',
        'Mis ganancias ilícitas me permiten mantener a mi familia.',
        'Algo importante fue tomado de mí y debo recuperarlo.',
        'Llegaré a ser el mayor ladrón que jamás haya vivido.',
        'Robé de alguien que no lo merecía. Trato de repararlo.',
        'Soy culpable de un crimen terrible. Espero poder redimirme.'
      ],
      flaws: [
        'Cuando veo algo valioso, no puedo pensar en otra cosa que en cómo robarlo.',
        'Cuando hay dinero de por medio, me olvido de mis lealtades.',
        'Si hay un plan, me gusta sabotearlo para ver qué pasa.',
        'Prefiero adquirir un aliado poderoso que jugarme la vida en una batalla perdida.',
        'El hedor de la corrupción del mundo me pudre. Si alguien lo menciona, entro en un descontrol de ira.',
        'Me resulta difícil confiar en mis aliados.'
      ]
    },
    starting_equipment: [
      { item_name: 'Crowbar', quantity: 1 },
      { item_name: "Thieves' Tools", quantity: 1 },
      { item_name: 'Common Clothes', quantity: 1 },
    ]
  },
  {
    name: 'Folk Hero',
    feature_name: 'Rustic Hospitality',
    feature_description: 'Since you come from the ranks of the common folk, you fit in among them with ease. You can find a place to hide, rest, or recuperate among commoners unless you have shown yourself to be a danger to them.',
    roleplay_data: {
      personality_traits: [
        'Juzgo a la gente por sus acciones, no por sus palabras.',
        'Si alguien está en problemas, siempre estoy dispuesto a ayudar.',
        'Cuando me enfrento a un problema, mi primer pensamiento es siempre resolver el problema.',
        'No confío en mis instintos sino que los analizo fríamente.',
        'Prefiero los tratos honestos, incluso cuando me perjudican.',
        'Tengo tendencia a no lavarme la ropa y otros hábitos molestos.',
        'Me resulta difícil relacionarme con la nobleza.',
        'Tengo demasiada confianza en mis habilidades.'
      ],
      ideals: [
        'Respeto. La gente merece ser tratada con dignidad y respeto.',
        'Equidad. Nadie debería ocupar un lugar privilegiado en la sociedad.',
        'Libertad. Tiranos no deben gobernar sobre el pueblo libre.',
        'Poder. Si me convierto en alguien poderoso, podré hacer el bien a todos.',
        'Sinceridad. No hay bien en fingir ser alguien que no soy.',
        'Destino. Nada ni nadie puede cambiar mi destino.'
      ],
      bonds: [
        'Tengo una familia, pero no sé dónde están. Espero que estén bien.',
        'Compartí pan con un viajero que resultó ser un aventurero. Espero ser como él algún día.',
        'Vengo de una pequeña aldea que fue destruida. Juro ayudar a su reconstrucción.',
        'El señor que oprimía a mi gente morirá por mi mano.',
        'Mi herramienta de trabajo es mi posesión más preciada y me recuerda a mi vida pasada.',
        'Protejo a quienes no pueden protegerse a sí mismos.'
      ],
      flaws: [
        'El tirano que oprima a su pueblo encontrará en mí a su peor enemigo.',
        'Me cuesta refrendar órdenes de quienes creo que son mis inferiores.',
        'Me resulta difícil superar la injusticia sin actuar, incluso cuando es peligroso.',
        'Me muevo mejor cuando tengo un plan de acción claro.',
        'Soy lento para confiar en los miembros de otras razas, tribus y sociedades.',
        'Me resulta difícil no hablar directamente cuando algo me molesta.'
      ]
    },
    starting_equipment: [
      { item_name: "Artisan's Tools", quantity: 1 },
      { item_name: 'Shovel', quantity: 1 },
      { item_name: 'Iron Pot', quantity: 1 },
      { item_name: 'Common Clothes', quantity: 1 },
    ]
  },
  {
    name: 'Noble',
    feature_name: 'Position of Privilege',
    feature_description: 'Thanks to your noble birth, people are inclined to think the best of you. You are welcome in high society, and people assume you have the right to be wherever you are.',
    roleplay_data: {
      personality_traits: [
        'Mi elocuencia y mi encanto personal son mis mayores activos.',
        'Me gusta rodearse de personas hermosas.',
        'Me esfuerzo siempre por mantener altos los estandares de comportamiento.',
        'Tomo préstamos de buena fe y siempre los devuelvo.',
        'No me gusta ensuciarme las manos.',
        'A pesar de mi posición, soy sincero con las personas.',
        'Me resulta difícil relacionarme con gente de clase baja.',
        'Me apresuro a juzgar a los demás, pero tardo en juzgarme a mí mismo.'
      ],
      ideals: [
        'Respeto. El respeto es el fundamento de toda relación duradera.',
        'Responsabilidad. Es mi deber proteger y cuidar a los que dependen de mí.',
        'Independencia. Mi familia espera que siga sus pasos; yo prefiero el camino que elijo.',
        'Poder. Si pudiera llegar a la posición más alta de la sociedad, podría hacer el bien.',
        'Familia. La sangre es más espesa que el agua.',
        'Obligación. Es mi obligación proteger a los que no pueden protegerse a sí mismos.'
      ],
      bonds: [
        'Protegeré a mi familia a cualquier coste.',
        'La alianza entre mi familia y otra noble familia debe perdurar.',
        'Nada es más importante que mi honor.',
        'Haré lo que sea para preservar el legado de mi familia.',
        'Me comprometí con alguien especial cuando éramos niños.',
        'Soy responsable de la seguridad y bienestar de mi pueblo.'
      ],
      flaws: [
        'Secretamente, creo que los demás son inferiores a mí.',
        'Oculto un escándalo que podría arruinar a mi familia.',
        'Demasiado a menudo escucho sólo a mis propios consejos.',
        'Me resulta difícil no insultar a quienes tienen peor nacimiento que yo.',
        'Hago lo que sea para ganar fama y reconocimiento.',
        'Me resulta difícil enfrentar la verdad cuando la verdad no me favorece.'
      ]
    },
    starting_equipment: [
      { item_name: 'Fine Clothes', quantity: 1 },
      { item_name: 'Signet Ring', quantity: 1 },
      { item_name: 'Scroll of Pedigree', quantity: 1 },
    ]
  },
  {
    name: 'Sage',
    feature_name: 'Researcher',
    feature_description: 'When you attempt to learn or recall a piece of lore, if you do not know it yourself, you often know where and from whom you can obtain it.',
    roleplay_data: {
      personality_traits: [
        'Uso palabras polisílabas que transmiten la impresión de gran erudición.',
        'Leí un número ingente de libros sobre muchos temas, aunque no los recuerdo todos.',
        'Suelo hablar con mis compañeros, cuando en realidad debería escucharlos.',
        'No me cuesta nada admitir que no sé algo.',
        'Me resulta difícil relacionarme con personas incultas.',
        'Tengo un sentido del humor peculiar.',
        'Siempre reviso los datos más de una vez para asegurarme.',
        'Me cuesta concentrarme en el presente cuando me imagino el futuro.'
      ],
      ideals: [
        'Conocimiento. El camino hacia el poder y la mejora personal pasa por el conocimiento.',
        'Belleza. Lo que es bello apunta hacia algo más profundo.',
        'Lógica. Las emociones nunca deben nublar el pensamiento lógico.',
        'Sin límites. Nada debería frenar el potencial ilimitado inherente a toda vida inteligente.',
        'Poder. El conocimiento es poder, y el poder debe protegerse.',
        'Autouperación. El objetivo de una vida de estudio es la automejora.'
      ],
      bonds: [
        'La biblioteca donde aprendí a leer es el edificio más importante de la ciudad.',
        'Tengo una obra de arte de un maestro que inspiró mi curiosidad.',
        'Estoy escribiendo un gran trabajo que cambiará la forma en que la gente ve el mundo.',
        'Tengo un mentor que me enseñó todo lo que sé.',
        'Guardo una obra perdida de un gran erudito.',
        'Soy responsable de proteger el conocimiento de incontables generaciones.'
      ],
      flaws: [
        'Tengo la costumbre de resumir los cuentos de otros con versiones más cortas de la misma historia.',
        'Me aburro con facilidad de la compañía de personas poco inteligentes.',
        'Una voz interior siempre me advierte de los peligros del conocimiento.',
        'Hablo con demasiada lentitud y no sé cuándo parar.',
        'No presto suficiente atención a los pensamientos de quienes me rodean.',
        'No me fío de mi memoria, así que escribo todo.'
      ]
    },
    starting_equipment: [
      { item_name: 'Book of Lore', quantity: 1 },
      { item_name: 'Ink', quantity: 1 },
      { item_name: 'Inkpen', quantity: 1 },
      { item_name: 'Common Clothes', quantity: 1 },
    ]
  },
  {
    name: 'Soldier',
    feature_name: 'Military Rank',
    feature_description: 'You have a military rank from your career as a soldier. Soldiers loyal to your former military organization still recognize your authority, and you can invoke it to exert influence over soldiers.',
    roleplay_data: {
      personality_traits: [
        'Siempre soy educado y respetuoso.',
        'Me han acosado duramente y aprendí a resistir.',
        'Soy de pocas palabras y siempre voy al grano.',
        'Sigo pensando en mis compañeros caídos y en cómo proteger a los que quedan.',
        'Obedezco órdenes con prontitud. Obedecer las reglas es lo que me mantiene con vida.',
        'Tengo una piel de elefante y los insultos me resbalan.',
        'Me enorgullezco de mis habilidades de combate.',
        'Soy lento para confiar, pero leal a muerte con los que me demuestran lealtad.'
      ],
      ideals: [
        'Mayor bien. Nuestro destino es dar la vida por algo más grande.',
        'Responsabilidad. Hago lo que debo y acepto sus consecuencias.',
        'Independencia. Cuando la gente sigue órdenes ciegamente, sólo conduce a la tiranía.',
        'Poder. En la vida, los fuertes deben mandar a los débiles.',
        'Vida. Haré todo lo necesario para sobrevivir.',
        'Gloria. Debo asegurarme de que mi fama llegue a los libros de historia.'
      ],
      bonds: [
        'Lucho por los que no pueden luchar por sí mismos.',
        'Alguien salvó mi vida en el campo de batalla. Debo devolverle ese favor.',
        'Mi honor es todo para mí. Moriría antes de perderlo.',
        'Nunca olvidaré a la unidad que perdí. Tengo que asegurarme de que sus muertes no hayan sido en vano.',
        'Sigo en servicio del gobernante que me reclutó.',
        'La ciudad que crió a mi familia está amenazada; debo hacer todo lo posible para protegerla.'
      ],
      flaws: [
        'El monstruo al que sirve mi enemigo me horroriza.',
        'La vista de la muerte me aterra, aunque sea de los enemigos.',
        'Cometo errores horribles cuando estoy bajo presión.',
        'Me cuesta confiar en mis propios instintos.',
        'Tengo dificultades para seguir adelante después del fracaso.',
        'Demasiado a menudo arriesgo mis aliados con mis propias decisiones.'
      ]
    },
    starting_equipment: [
      { item_name: 'Insignia of Rank', quantity: 1 },
      { item_name: 'Trophy', quantity: 1 },
      { item_name: 'Deck of Cards', quantity: 1 },
      { item_name: 'Common Clothes', quantity: 1 },
    ]
  },
  {
    name: 'Entertainer',
    feature_name: 'By Popular Demand',
    feature_description: 'You can always find a place to perform in any place that features entertainment, receiving free lodging and food in exchange for a performance.',
    roleplay_data: {
      personality_traits: [
        'Conozco un chiste para cada ocasión, especialmente las inapropiadas.',
        'Cuando no estoy actuando, suelo ser sombrío y callado.',
        'Me gusta estar en el corazón de cualquier reunión y en el centro de la atención.',
        'Cambio entre el humor y la seriedad constantemente.',
        'Me encanta cortejar, aunque no tengo intención de que llegue a nada.',
        'Creo que todo el mundo quiere escuchar mis historias.',
        'Creo que puedo convencer a cualquier persona de cualquier cosa.',
        'Me resulta difícil aprender de mis errores.'
      ],
      ideals: [
        'Belleza. Cuando actúo, hago que el mundo sea un lugar mejor.',
        'Tradición. Los cuentos, las canciones y la poesía del pasado no deben olvidarse.',
        'Creatividad. El mundo necesita nuevas ideas y valientes acciones.',
        'Avaricia. Sólo estoy en esto por el dinero y la fama.',
        'Pueblo. El entretenimiento es para todos.',
        'Honestidad. El arte debería reflejar la verdad del mundo.'
      ],
      bonds: [
        'Mi instrumento es mi posesión más preciada, y me recuerda a alguien que amo.',
        'Alguien me robó mi actuación y lo haré pagar.',
        'Quiero ser famoso, cueste lo que cueste.',
        'Deseo proteger al público al que entrtengo.',
        'Un mecenas me ayudó en los primeros tiempos de mi carrera.',
        'Mi troupe de actores es mi familia.'
      ],
      flaws: [
        'Hago cualquier cosa por fama y reconocimiento.',
        'Soy esclavo de mis pasiones: bebida, juego y diversión.',
        'Me resulta difícil hacer nada si no me aplaudirán por ello.',
        'Si hay algo que odio, es ser ignorado.',
        'Me cuesta guardar un secreto.',
        'Creo que todo el mundo me ama y me equivoco con frecuencia.'
      ]
    },
    starting_equipment: [
      { item_name: 'Musical Instrument', quantity: 1 },
      { item_name: 'Costume', quantity: 1 },
    ]
  },
  {
    name: 'Guild Artisan',
    feature_name: 'Guild Membership',
    feature_description: 'You have a network of contacts among your guild members. Fellow guild members will provide you with lodging and food, and you can call on them to help in legal matters.',
    roleplay_data: {
      personality_traits: [
        'Creo que cualquier cosa que valga la pena hacer, vale la pena hacerla bien.',
        'Me gusta enseñar mi oficio a otros.',
        'Soy orgulloso de mi trabajo y tengo dificultades para aceptar críticas.',
        'Soy un perfeccionista que examina todo con los ojos más críticos.',
        'Trabajo duro y espero que los demás hagan lo mismo.',
        'Disfruto del proceso de creación tanto como del resultado.',
        'Soy exigente conmigo mismo, pero igual con los demás.',
        'Me resulta difícil dejar pasar un trabajo mal hecho.'
      ],
      ideals: [
        'Comunidad. Es el deber de toda persona civilizada reforzar la comunidad.',
        'Generosidad. Mis talentos son para compartirlos con todos.',
        'Libertad. Todo el mundo debe ser libre de buscar su propio medio de vida.',
        'Avaricia. Sólo busco mis propios intereses.',
        'Pueblo. Soy leal a mis amigos, no a los ideales.',
        'Aspiración. Trabajo para ser el mejor artesano del mundo.'
      ],
      bonds: [
        'El taller donde aprendí mi oficio es el lugar que más valoro.',
        'Construí algo para alguien y se lo robaron. Voy a recuperarlo.',
        'Perseguiré la perfecta expresión de mi arte, aunque me lleve toda la vida.',
        'Algún día devolveré el dinero que le debo a un benefactor generoso.',
        'Estoy en deuda con mi gremio por todo lo que me ha dado.',
        'Soy responsable de mantener el prestigio de mi gremio.'
      ],
      flaws: [
        'Haré cualquier cosa por conseguir el material o la herramienta rara que necesito.',
        'Tengo tendencia a coquetear con personas de poder.',
        'Me resulta difícil tomar una decisión sin pensar primero en el coste.',
        'Nunca me resulta suficientemente bueno lo que hago.',
        'Me resulta difícil confiar en los que no son artesanos.',
        'Me cuesta dejar de trabajar aunque no deba.'
      ]
    },
    starting_equipment: [
      { item_name: "Artisan's Tools", quantity: 1 },
      { item_name: 'Common Clothes', quantity: 1 },
    ]
  },
  {
    name: 'Hermit',
    feature_name: 'Discovery',
    feature_description: 'Your isolation gave you access to a unique and powerful discovery — a great truth about the cosmos, the nature of the divine, or some other esoteric knowledge.',
    roleplay_data: {
      personality_traits: [
        'He sido durante tanto tiempo solo que me resulta extraño estar en un grupo.',
        'Tengo una forma de hablar que resulta extraña para los demás.',
        'Estoy completamente enamorado de la belleza natural del mundo.',
        'Mi disciplina espiritual me aporta una gran calma incluso en las situaciones de mayor tensión.',
        'Me resulta inusualmente fácil conectar con los animales.',
        'La naturaleza me recuerda el orden que subyace a toda existencia.',
        'Me resulta difícil relacionarme con personas que no comparten mi devoción.',
        'Las ciudades y el ruido me resultan abrumadores.'
      ],
      ideals: [
        'Mayor bien. Mi dones son para compartirlos con el mundo.',
        'Lógica. Las emociones no deben nublar el pensamiento.',
        'Vida. Honro a todos los seres vivos y procuro no hacerles daño.',
        'Gloria. Mis logros son para la gloria de mi dios.',
        'Pueblo. Solo me preocupan quienes me importan.',
        'Reflexión. Busco emular a los dioses en todos mis actos.'
      ],
      bonds: [
        'Nada es tan importante para mí como los demás ermitaños de mi monasterio.',
        'Entré al mundo para explorar una visión que tuve durante mi meditación.',
        'Pasaré el resto de mi vida buscando la iluminación.',
        'Me resulta difícil olvidar la injusticia de mi pasado.',
        'Tengo una mascota que me ha acompañado en mi aislamiento.',
        'Busco recuperar el texto sagrado que me fue robado.'
      ],
      flaws: [
        'Ahora que he vuelto al mundo, soy adicto a sus placeres.',
        'Me resulta difícil confiar en alguien que no comparte mis creencias.',
        'Me resulta difícil actuar sin pensar durante horas.',
        'Soy dogmático y no puedo aceptar que me desafíen.',
        'Tengo miedo de que algo que descubrí en mi aislamiento sea malo.',
        'Me resulta imposible mantener un secreto si me lo preguntan directamente.'
      ]
    },
    starting_equipment: [
      { item_name: "Herbalism Kit", quantity: 1 },
      { item_name: 'Common Clothes', quantity: 1 },
      { item_name: 'Scroll of Lore', quantity: 1 },
    ]
  },
  {
    name: 'Outlander',
    feature_name: 'Wanderer',
    feature_description: 'You have an excellent memory for maps and geography, and you can always recall the general layout of terrain, settlements, and other features around you.',
    roleplay_data: {
      personality_traits: [
        'Estoy atormentado por recuerdos de la guerra.',
        'Me siento mucho más cómodo con los animales que con la gente.',
        'Hablo poco, pero cuando lo hago la gente escucha.',
        'Prefiero actuar que hablar.',
        'Me pregunto si todo el mundo tiene miedo tan a menudo como yo.',
        'Cuando algo va mal, siempre actúo según mis instintos.',
        'No confío en los que usan la magia.',
        'No me gusta tener deudas con nadie.'
      ],
      ideals: [
        'Cambio. La vida es como las estaciones, y hay que adaptarse siempre.',
        'Mayor bien. Hay que ayudar a los más necesitados.',
        'Honor. Si deshonro a mi tribu, deshonro a todo lo que ella valora.',
        'Poder. La más fuerte sobrevive.',
        'Naturaleza. El mundo es mucho más sabio que cualquier civilización.',
        'Gloria. Debo ganarme mi lugar en el mundo haciendo grandes cosas.'
      ],
      bonds: [
        'Mi familia, mi tribu o mi clan son lo más importante para mí.',
        'Un insoportable desastre le ha sucedido a mi tierra natal y debo vengarme.',
        'Sufro por la pérdida de algo que me fue muy valioso.',
        'Me siento responsable de proteger la tierra que una vez llamé hogar.',
        'Debo encontrar el camino de regreso a mi hogar.',
        'Llevaré a quienes me sigan a la seguridad.'
      ],
      flaws: [
        'Tengo dificultades para confiar en quienes no pertenecen a mi tribu.',
        'La violencia es mi primera respuesta ante cualquier desafío.',
        'Me resulta difícil observar las convenciones de la sociedad civilizada.',
        'No tengo paciencia para los cobardes.',
        'Me pongo furioso cuando alguien amenaza a mi tierra natal.',
        'Me resulta difícil resistirme a tomar lo que necesito.'
      ]
    },
    starting_equipment: [
      { item_name: 'Staff', quantity: 1 },
      { item_name: 'Hunting Trap', quantity: 1 },
      { item_name: 'Common Clothes', quantity: 1 },
    ]
  },
  {
    name: 'Charlatan',
    feature_name: 'False Identity',
    feature_description: 'You have created a second identity that includes documentation, established acquaintances, and disguises that allow you to assume that persona.',
    roleplay_data: {
      personality_traits: [
        'Tengo un chiste para cada ocasión.',
        'Me adapto fácilmente a cualquier situación y me hago pasar por lo que sea.',
        'Soy un mentiroso consumado y nunca digo la verdad si una mentira puede servirme mejor.',
        'Creo que debo siempre tener un plan de emergencia.',
        'Confundo a la gente para que piense que soy más inteligente de lo que soy.',
        'Tengo una estafa específica que repito a lo largo de los años.',
        'Siempre tengo algo que vender.',
        'Soy un maestro del disfraz.'
      ],
      ideals: [
        'Independencia. Soy un espíritu libre y nadie me dice qué hacer.',
        'Equidad. Nunca me aprovecho de los pobres ni de los desesperados.',
        'Creatividad. Nunca empleo la misma estafa dos veces.',
        'Amistad. El dinero y el poder son buenos, pero los amigos son mejores.',
        'Aspiración. Soy un estafador, pero aspiro a ser alguien mejor.',
        'Pueblo. Me preocupo por los que conozco.'
      ],
      bonds: [
        'Tengo deudas que no puedo pagar si quiero sobrevivir.',
        'Huí de mi ciudad natal y debo regresar algún día.',
        'Traicioné a alguien querido y tengo que compensarlo.',
        'Mi mayor estafa me consiguió un enemigo poderoso.',
        'Me enamoré de la persona que fui a estafar.',
        'Algún día me vengaré de quien me enseñó el oficio.'
      ],
      flaws: [
        'Robo de los ricos y lo guardo todo para mí.',
        'Me encanta el dinero más que casi cualquier cosa del mundo.',
        'Me convenzo de que todos hacen lo mismo.',
        'Soy demasiado codicioso y a veces me pongo en peligro.',
        'No puedo resistirme a una estafa cuando veo la oportunidad.',
        'Me cuesta cumplir una promesa.'
      ]
    },
    starting_equipment: [
      { item_name: "Disguise Kit", quantity: 1 },
      { item_name: "Forgery Kit", quantity: 1 },
      { item_name: 'Fine Clothes', quantity: 1 },
    ]
  },
  {
    name: 'Sailor',
    feature_name: "Ship's Passage",
    feature_description: 'When you need to, you can secure free passage on a sailing ship for yourself and your adventuring companions. You might sail on the ship you served on, or another vessel.',
    roleplay_data: {
      personality_traits: [
        'Me comporto con rudeza en tierra, aunque en el mar soy un marinero experto.',
        'Cuido mucho de mis compañeros de tripulación como si fueran mi familia.',
        'Soy muy directo y digo lo que pienso.',
        'El horizonte siempre me atrae; siempre hay algo más allá.',
        'Siempre tengo historias del mar para contar.',
        'Cuando hay una tormenta, soy el más tranquilo de todos.',
        'Tengo una canción marinera para cada ocasión.',
        'No tengo miedo del mar ni de sus peligros.'
      ],
      ideals: [
        'Respeto. Lo que mantiene un barco a flote son el respeto mutuo y la lealtad.',
        'Equidad. Todos trabajamos juntos en este barco.',
        'Libertad. El mar libre es el único lugar donde puedo ser yo mismo.',
        'Dominio. Seré el capitán de mi propio destino.',
        'Pueblo. Soy leal a mi tripulación, no a ningún ideal.',
        'Aspiración. Aspiro a descubrir tierras lejanas.'
      ],
      bonds: [
        'Soy leal al capitán que me contrató cuando más lo necesitaba.',
        'El barco en que sirvo es mi hogar.',
        'Cuida de la tripulación como si fuera tu familia.',
        'Debo algo importante a un contacto en puerto.',
        'Busco vengarme de los piratas que destruyeron mi barco.',
        'Llevo un diario de mis viajes que algún día publicaré.'
      ],
      flaws: [
        'Sigo las órdenes incluso cuando sé que están mal.',
        'Me resulta difícil confiar en alguien que no ha navegado.',
        'Cuando se acerca una tormenta, me temo lo peor.',
        'Me entrego demasiado a los placeres portuarios.',
        'A veces riesgo la vida de mis compañeros por dinero o gloria.',
        'No sé muy bien cómo relacionarme en tierra.'
      ]
    },
    starting_equipment: [
      { item_name: "Navigator's Tools", quantity: 1 },
      { item_name: 'Rope (Silk)', quantity: 1 },
      { item_name: 'Common Clothes', quantity: 1 },
    ]
  },
  {
    name: 'Urchin',
    feature_name: 'City Secrets',
    feature_description: 'You know the secret patterns and flow to cities and can find passages through the urban sprawl that others would miss. You can move twice the normal speed while traveling in a city.',
    roleplay_data: {
      personality_traits: [
        'Oculto comida y otros objetos por hábito.',
        'Pregunto muchas preguntas.',
        'Me gustan los objetos pequeños y brillantes.',
        'Duermo con la espalda pegada a la pared y con los ojos abiertos.',
        'Me resulta difícil confiar en los adultos.',
        'Hablo muy de prisa cuando me emociono.',
        'Me resulta difícil relacionarme con gente de clase alta.',
        'Siempre busco la salida más cercana de cualquier lugar.'
      ],
      ideals: [
        'Respeto. Todos merecen respeto, incluso los más humildes.',
        'Comunidad. Tenemos que cuidarnos mutuamente.',
        'Cambio. Las injusticias del presente deben ceder ante la justicia del futuro.',
        'Avaricia. Solo me importa yo y los que me importan.',
        'Pueblo. Soy leal a quienes me conocen.',
        'Aspiración. Algún día haré algo grande.'
      ],
      bonds: [
        'Mi ciudad es mi hogar y lucharé para defenderla.',
        'Patrocino a un orfanato para mantener a otros niños lejos de las calles.',
        'Debo mi supervivencia a otro sinvergüenza que me enseñó sus trucos.',
        'Nadie más debería vivir lo que yo viví.',
        'Me escapé de la pobreza y nunca volveré.',
        'Debo vengarme de la organización criminal que me tuvo a su servicio.'
      ],
      flaws: [
        'Soy deshonesto cuando la honestidad no me favorece.',
        'No sé cómo dejar de robar a los que conozco.',
        'Me resulta imposible confiar en alguien de clase alta.',
        'Me cuesta dejar de ver a todo el mundo como una amenaza.',
        'Una vez al año me pongo en situaciones de riesgo.',
        'Me resulta muy difícil pedir ayuda.'
      ]
    },
    starting_equipment: [
      { item_name: "Disguise Kit", quantity: 1 },
      { item_name: 'Common Clothes', quantity: 1 },
    ]
  },
];

export async function seedBackgroundData(prisma: PrismaClient) {
  console.log('  → Seeding background roleplay data + starting equipment...');
  let count = 0;
  for (const bg of BACKGROUNDS) {
    const updated = await prisma.background.updateMany({
      where: { name: { equals: bg.name, mode: 'insensitive' } },
      data: {
        roleplay_data:      bg.roleplay_data as any,
        starting_equipment: bg.starting_equipment as any,
        feature_name:       bg.feature_name,
        feature_description: bg.feature_description,
      },
    });
    if (updated.count > 0) count++;
  }
  console.log(`    ✓ ${count} backgrounds updated with roleplay data and starting equipment.`);
}
