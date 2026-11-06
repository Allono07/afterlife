import Link from 'next/link';
import Image from 'next/image';
import {ArrowRight,ArrowUpRight} from 'lucide-react';

const testimonials: {name:string;quote:string}[] = [];
const clientLogos: {name:string;src:string}[] = [];

const projects = [
  {name:'Trashbuddy',type:'COMMUNITY PRODUCT / APP + BACKEND',problem:'People often miss irregular BBMP waste collection visits in their lane.',built:'A community app that shares nearby collection vehicle updates and alerts residents when an auto is close.',result:'Used by residents to know when collection is nearby. [Add verified usage or impact details]'},
  {name:'Mayaloka',type:'COMMERCE / WEBSITE',problem:'The brand needed a clear online storefront for its jewellery and lifestyle collections.',built:'A responsive e-commerce website shaped around the brand and its product catalogue.',result:'[Add verified business result when available]'},
  {name:'Inventory management system',type:'INTERNAL OPERATIONS / NDA',problem:'A business needed a better way to manage internal inventory.',built:'A private inventory application tailored to the team’s workflows.',result:'Client details withheld under NDA. [Add approved, non-identifying outcome]'},
];

const faqs = [
  ['How do we get started?','Tell us what is taking time, creating friction, or needs to work better. We’ll discuss the problem and recommend a useful first step.'],
  ['How long does a project take?','Timing depends on scope, integrations, and how quickly we can review decisions together. We’ll outline milestones before work begins.'],
  ['How do you price projects?','We scope each project around the work involved and share a proposal before starting. Reach out with the challenge for an estimate.'],
  ['Who owns the code and creative files?','Ownership and handover are agreed in the project proposal, so the deliverables and any third-party tools are clear before kickoff.'],
  ['Do you support the work after launch?','We can agree on a support and improvement plan around the product, workflow, or content we deliver.'],
];

export function ConversionSections(){
  return <div className="conversion-sections">
    <section className="offer-bridge" aria-labelledby="bridge-title">
      <div><p className="world-kicker">ONE STUDIO / CONNECTED WORK</p><h2 id="bridge-title">Build the system.<br/><em>Make what feeds it.</em></h2></div>
      <div className="offer-bridge-copy"><p>We bring software, AI workflows, and media together around the way your business works: practical systems for the work behind the scenes, and clear content for the people you serve.</p><div className="offer-links"><Link href="/lab/software">Software &amp; AI <ArrowUpRight size={15}/></Link><Link href="/lab/ads">Media &amp; content <ArrowUpRight size={15}/></Link></div></div>
      <Link className="combined-offer" href="/contact?interest=Combined%20software%20and%20content%20project" data-conversion="cta_click:combined_offer"><span className="world-kicker">A CONNECTED START</span><strong>Business system + content starter</strong><span>We’ll scope the right mix for your team, then share a clear proposal.</span><span className="combined-offer-link">Talk through your idea <ArrowRight size={15}/></span></Link>
    </section>
    <section className="proof-section" aria-labelledby="proof-title"><div className="conversion-heading"><div><p className="world-kicker">SELECTED WORK / BUILT FOR REAL NEEDS</p><h2 id="proof-title">A few things we’ve made.</h2></div><Link href="/lab/software">Explore software work <ArrowUpRight size={15}/></Link></div>
      <div className="proof-grid">{projects.map((project,index)=><article className="proof-card" key={project.name}><span className="proof-index">0{index+1}</span><p className="world-kicker">{project.type}</p><h3>{project.name}</h3><dl><div><dt>THE NEED</dt><dd>{project.problem}</dd></div><div><dt>WHAT WE BUILT</dt><dd>{project.built}</dd></div><div><dt>RESULT</dt><dd>{project.result}</dd></div></dl></article>)}</div>
    </section>
    <section className="how-we-work" aria-labelledby="process-title"><div><p className="world-kicker">A CLEAR WAY FORWARD</p><h2 id="process-title">From challenge<br/><em>to useful change.</em></h2><p>Begin with a free, focused conversation. We can also review one workflow and suggest where a practical improvement may help.</p><Link className="text-action" href="/contact?interest=Free%20workflow%20mini-audit" data-conversion="cta_click:mini_audit">Ask about a free mini-audit <ArrowUpRight size={16}/></Link></div><ol>{[['01','Discover','Understand the business, the people, and the bottleneck.'],['02','Build','Design and make the smallest useful solution.'],['03','Launch & learn','Put it to work, gather feedback, and plan what comes next.']].map(([n,title,text])=><li key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>
    <section className="proof-details" aria-label="Testimonials and frequently asked questions">
      {testimonials.length>0&&<div className="testimonial-ready"><p className="world-kicker">FROM THE PEOPLE WE WORK WITH</p><h2>What clients say.</h2>{testimonials.map(item=><blockquote key={item.name}>“{item.quote}”<cite>{item.name}</cite></blockquote>)}</div>}
      {clientLogos.length>0&&<div className="client-logo-strip" aria-label="Selected clients">{clientLogos.map(item=><Image key={item.name} src={item.src} width={130} height={42} alt={item.name}/>)}</div>}
      <div className="faq-section"><div><p className="world-kicker">GOOD TO KNOW</p><h2>Before we begin.</h2><Link className="text-action" href="/contact" data-conversion="cta_click:faq_contact">Ask us directly</Link></div><div className="faq-list">{faqs.map(([question,answer])=><details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></div>
    </section>
    <section className="conversion-endcap"><div><p className="world-kicker">HAVE A BUSINESS CHALLENGE?</p><h2>Let’s find a useful<br/><em>place to begin.</em></h2></div><Link className="world-action" href="/contact" data-conversion="cta_click:what_we_do_endcap">Start a conversation</Link></section>
  </div>;
}
