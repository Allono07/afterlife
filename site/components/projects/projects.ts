export type ProjectCategory='web'|'app'|'backend'|'ai'|'animation'|'identity';
export type ProjectMedia={src:string;alt:string;device:'desktop'|'mobile'};
export type Project={id:string;name:string;url:string;summary:string;categories:ProjectCategory[];services:string[];stack:string[];media:ProjectMedia[];video?:string;accent:string};
const assets='/assets/projects/';
export const projects:Project[]=[
  {id:'trashbuddy',name:'Trashbuddy',url:'https://trashbuddy.in',summary:'An application that tracks BBMP waste collection autos and alerts you when they are near your building, so you never miss your garbage disposal.',categories:['web','app','backend'],services:['products'],stack:['Redis Streams','Firebase','OpenStreetMap','Redis'],accent:'#467547',video:assets+'trashbuddy-desktop.mp4',media:[
    {src:assets+'trashbuddy-desktop.webp',alt:'Trashbuddy website preview',device:'desktop'},
    {src:assets+'trashbuddy_mobile_app_1.webp',alt:'Trashbuddy mobile app showing an active location-sharing session',device:'mobile'},
    {src:assets+'trashbuddy_mobile_app_2.webp',alt:'Trashbuddy mobile app map interface',device:'mobile'},
    {src:assets+'trashbuddy_mobile_app_3.webp',alt:'Trashbuddy mobile app screen',device:'mobile'},
  ]},
  {id:'mayaloka',name:'Mayaloka',url:'https://mayaloka.co.in/',summary:'A responsive storefront for jewellery and lifestyle collections, bringing the brand’s visual identity to desktop and mobile.',categories:['web'],services:['products'],stack:[],accent:'#873c38',media:[
    {src:assets+'mayaloka_desktop_web_2.webp',alt:'Mayaloka jewellery storefront with its collection hero',device:'desktop'},
    {src:assets+'mayaloka_mobile_web.webp',alt:'Mayaloka storefront on mobile',device:'mobile'},
    {src:assets+'mayaloka_desktop_web_1.webp',alt:'Mayaloka product collection page',device:'desktop'},
  ]},
];
export const categoryLabels:Record<ProjectCategory,string>={web:'Websites',app:'Apps',backend:'Backend',ai:'AI solutions',animation:'Animation',identity:'Brand identity'};
