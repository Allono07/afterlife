export type Service = {
  id: string; label: string; title: string; description: string;
  steps: [string, string, string]; outcome: string;
};

export const labs = {
  software: {
    number: '01', name: 'Software & AI Solutions', image: 'softwarelab',
    title: ['Grounded in context.', 'Built for possibility.'],
    intro: 'From your first idea to the systems that move your business forward.',
    services: [
      {id:'context-models',label:'Business-context AI',title:'Your context. More relevant intelligence.',description:'We build and adapt AI around your business knowledge and real tasks with natively built ML models. The focus: more relevant answers and an inference cost that fits the job.',steps:['Your business context','Model & evaluation','Relevant, efficient AI'],outcome:'A model approach shaped around your data, quality needs, and operating budget.'},
      {id:'ai-workflows',label:'AI workflows',title:'Let the work flow.',description:'Connect AI to the tools and processes your team already uses. We build workflows that handle repetitive steps and bring people in where judgement matters.',steps:['Map the process','Connect the tools','Automate with oversight'],outcome:'Connected workflows, clear handoffs, and human review where it counts.'},
      {id:'products',label:'Products, web & apps',title:'Make the useful feel effortless.',description:'We turn business problems into software products, websites, and applications. From the interface to the systems behind it, the pieces are designed to work together.',steps:['Understand the problem','Design & engineer','Launch & iterate'],outcome:'A software solution built around the people who will actually use it.'},
      {id:'mvp',label:'Idea to MVP',title:'Give your idea a first life.',description:'Start with the smallest version that can answer the biggest question. We help shape your idea, choose the essential features, and build an MVP you can put in front of real users.',steps:['Clarify the idea','Shape the first version','Build & learn'],outcome:'A focused first release and a clearer direction for what comes next.'},
    ] satisfies Service[],
  },
  ads: {
    number:'02',name:'Media Content Creation',image:'adlab',
    title:['Make people pause.', 'Give ideas motion.'],
    intro:'Distinctive identities, moving stories, and brand advertising shaped with AI.',
    services:[
      {id:'animation',label:'Animation & short-form',title:'A story worth staying for.',description:'Animations for YouTube and short-form content, built around your story, audience, and platform. We shape the visual direction and motion into a coherent piece.',steps:['Story & direction','Animation & editing','Platform-ready content'],outcome:'Purposeful motion for longer stories and the moments that need to land quickly.'},
      {id:'brand',label:'Brand kits & logos',title:'A world that feels like you.',description:'A recognisable identity starts with a clear idea. We create logos and brand kits that bring your typography, colour, and visual language into one consistent direction.',steps:['Brand character','Logo & visual language','A coherent brand kit'],outcome:'An identity you can carry consistently across your website, content, and campaigns.'},
      // {id:'campaigns',label:'AI ads for brands',title:'From a brand idea to an impression.',description:'We combine creative direction and AI production to create advertising for brands. Concept, imagery, and motion are developed around what you want to communicate.',steps:['Campaign concept','AI creative production','Refine for the channel'],outcome:'Brand-led advertising assets shaped for your audience and intended placement.'},
    ] satisfies Service[],
  },
};

export const values = [
  {title:'Human purpose first.',text:'We start with people and the problem they face. Technology earns its place by making something more useful, understandable, or meaningful.',note:'Understand before prescribing.'},
  {title:'Build with intention.',text:'Every feature, workflow, and creative decision should serve a purpose. We favour clear choices and considered execution.',note:'Make every decision count.'},
  {title:'Stay curious.',text:'Progress begins with a better question. We explore, prototype, and test assumptions so that making becomes a way of learning.',note:'Leave room for discovery.'},
  {title:'Own the outcome.',text:'Delivery is part of the journey. We care about how the work performs in the world and what the next iteration can improve.',note:'Care beyond the handoff.'},
];
