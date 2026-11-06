export type Service = {
  id: string; label: string; title: string; description: string;
  steps: [string, string, string]; outcome: string;
};

export const labs = {
  software: {
    number: '01', name: 'Software & AI Solutions', image: 'softwarelab',
    title: ['Technology for', 'the work you do.'],
    services: [
      {id:'context-models',label:'AI for your business',title:'Answers shaped around your business.',description:'Give your team an AI assistant that understands your documents, processes, and terminology. We plan how it uses your information and where it runs around your privacy and operational needs.',steps:['Understand your work','Prepare trusted information','Build & evaluate the assistant'],outcome:'Useful answers from your business knowledge, with information handling planned around your requirements.'},
      {id:'ai-workflows',label:'Automate repetitive work',title:'Give routine tasks back to your team.',description:'We connect the steps and tools behind recurring work, from sorting requests to updating records. Your team can review important decisions while routine handoffs happen automatically.',steps:['Map the repeated task','Connect your tools','Automate & review'],outcome:'Less manual follow-up and a clearer view of work moving through your business.'},
      {id:'products',label:'Business software, web & apps',title:'Software built around your day-to-day.',description:'Manage the work that matters with a website, application, or internal system designed for your actual process, team, and customers.',steps:['Understand the challenge','Design & build the system','Launch & improve'],outcome:'Practical software that fits the way your business operates.'},
      {id:'mvp',label:'Turn an idea into a first product',title:'Start with what needs to work first.',description:'We help clarify the idea, choose the essential features, and build a first version you can put in front of real users and learn from.',steps:['Clarify the idea','Choose the first features','Build & learn'],outcome:'A focused first release and a clear next step.'},
    ] satisfies Service[],
  },
  ads: {
    number:'02',name:'Media Content Creation',image:'adlab',
    title:['Content that', 'moves people.'],
    intro:'Animation, short-form video, brand identity, and advertising that help your business show up clearly.',
    services:[
      {id:'animation',label:'YouTube & short-form video',title:'Make one story work across screens.',description:'We create animation and short-form videos around your message, audience, and channel, ready to share across YouTube and social platforms.',steps:['Find the story','Create & edit','Prepare for each channel'],outcome:'Video content that helps your audience understand what you offer.'},
      {id:'brand',label:'Brand kits & logos',title:'Look and sound like one business.',description:'We create a logo and practical brand kit, including typography, colour, and visual guidance, so your business feels consistent wherever customers find you.',steps:['Define the direction','Design the identity','Prepare the brand kit'],outcome:'A recognisable identity your team can use across web, social, and campaigns.'},
      {id:'campaigns',label:'AI-assisted brand advertising',title:'Create ads around your brand.',description:'We develop advertising concepts and produce visual assets with a mix of creative direction and AI tools, tailored to your brand and intended channels.',steps:['Shape the campaign idea','Create the assets','Adapt for each channel'],outcome:'On-brand campaign creative ready for your chosen placements.'},
    ] satisfies Service[],
  },
};

export const values = [
  {title:'Human purpose first.',text:'We start with people and the problem they face. Technology earns its place by making something more useful, understandable, or meaningful.',note:'Understand before prescribing.'},
  {title:'Build with intention.',text:'Every feature, workflow, and creative decision should serve a purpose. We favour clear choices and considered execution.',note:'Make every decision count.'},
  {title:'Stay curious.',text:'Progress begins with a better question. We explore, prototype, and test assumptions so that making becomes a way of learning.',note:'Leave room for discovery.'},
  {title:'Own the outcome.',text:'Delivery is part of the journey. We care about how the work performs in the world and what the next iteration can improve.',note:'Care beyond the handoff.'},
];
