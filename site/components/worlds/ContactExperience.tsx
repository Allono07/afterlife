"use client";
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {ArrowLeft,ArrowUpRight,Check,Copy} from 'lucide-react';
import {useSearchParams} from 'next/navigation';
import {WorldShell} from './WorldShell';
import {labs} from './content';

const interests=[...labs.software.services,...labs.ads.services].map(service=>service.label);
type Enquiry={name:string;email:string;interest:string;message:string};
export function ContactExperience(){
  const queryInterest=useSearchParams().get('interest');
  const [chosenInterest,setInterest]=useState<string|null>(null);
  const interest=chosenInterest??(queryInterest&&interests.includes(queryInterest)?queryInterest:'');
  const formRef=useRef<HTMLFormElement>(null);
  const reviewTitle=useRef<HTMLHeadingElement>(null);
  const [review,setReview]=useState<Enquiry|null>(null);
  const [copyStatus,setCopyStatus]=useState('');
  useEffect(()=>{if(review)reviewTitle.current?.focus();},[review]);
  function reviewEnquiry(event:FormEvent<HTMLFormElement>){
    event.preventDefault();const data=new FormData(event.currentTarget);
    setReview({name:String(data.get('name')).trim(),email:String(data.get('email')).trim(),interest,message:String(data.get('message')).trim()});
    setCopyStatus('');
  }
  async function copy(){
    if(!review)return;
    try{await navigator.clipboard.writeText(`Name: ${review.name}\nEmail: ${review.email}\nInterested in: ${review.interest}\n\n${review.message}`);setCopyStatus('Enquiry copied.');}
    catch{setCopyStatus('Copy is unavailable. You can select and copy the preview text.');}
  }
  return <WorldShell image="adlab" label="Start a conversation">
    <div className="contact-layout">
      <div className="contact-intro"><p className="world-kicker">CONTACT / EVERY IDEA STARTS SOMEWHERE</p><h1>Something<br/>on your<br/><em>horizon?</em></h1><p>A half-formed idea, a business challenge, or a story waiting to be told. We’d love to hear it.</p></div>
      <section className="contact-panel" aria-label="Project enquiry">
        <form ref={formRef} name="contact" method="POST" data-netlify="true" onSubmit={reviewEnquiry} hidden={review!==null}>
          <input type="hidden" name="form-name" value="contact" />
          <p className="world-kicker">TELL US WHAT YOU’RE THINKING</p>
          <div className="contact-fields"><label>Your name<input name="name" autoComplete="name" required maxLength={100} /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com"/></label></div>
          <label>What would you like to create?<select name="interest" required value={interest} onChange={e=>setInterest(e.target.value)}><option value="" disabled>Choose a starting point</option><optgroup label="Software & AI Solutions">{labs.software.services.map(service=><option key={service.id}>{service.label}</option>)}</optgroup><optgroup label="Media Content Creation">{labs.ads.services.map(service=><option key={service.id}>{service.label}</option>)}</optgroup><option>Something else / Let’s explore</option></select></label>
          <label>A little about your idea<textarea name="message" required minLength={10} maxLength={5000} rows={4} placeholder="What are you hoping to build, change, or create?"/></label>
          <button type="submit" className="world-action">Review enquiry <ArrowUpRight size={18}/></button>
          <p className="contact-notice">Review your enquiry before sending it.</p>
        </form>
        {review&&<div className="enquiry-review"><p className="world-kicker">ENQUIRY PREVIEW</p><h2 ref={reviewTitle} tabIndex={-1}>Here’s your starting point.</h2><dl><dt>Name</dt><dd>{review.name}</dd><dt>Email</dt><dd>{review.email}</dd><dt>Interested in</dt><dd>{review.interest}</dd><dt>Your idea</dt><dd className="enquiry-message">{review.message}</dd></dl><button type="button" className="world-action" onClick={()=>formRef.current?.submit()}>Send enquiry <ArrowUpRight size={18}/></button><button type="button" className="world-action" onClick={copy}>{copyStatus==='Enquiry copied.'?<Check size={16}/>:<Copy size={16}/>} Copy enquiry</button><p className="contact-notice" role="status">{copyStatus||'Your enquiry is ready to send.'}</p><button className="edit-enquiry" onClick={()=>setReview(null)}><ArrowLeft size={14}/> Edit your enquiry</button></div>}
      </section>
    </div>
  </WorldShell>;
}
