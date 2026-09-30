"use client";
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {ArrowLeft,ArrowUpRight,Check,Copy} from 'lucide-react';
import {WorldShell} from './WorldShell';
import {labs} from './content';

const interests=[...labs.software.services,...labs.ads.services].map(service=>service.label);
type Enquiry={name:string;email:string;interest:string;message:string};
export function ContactExperience(){
  const interestRef=useRef<HTMLSelectElement>(null);
  const formRef=useRef<HTMLFormElement>(null);
  const reviewTitle=useRef<HTMLHeadingElement>(null);
  const successTitle=useRef<HTMLHeadingElement>(null);
  const [review,setReview]=useState<Enquiry|null>(null);
  const [copyStatus,setCopyStatus]=useState('');
  const [submitted,setSubmitted]=useState(false);
  const [isSubmitting,setIsSubmitting]=useState(false);
  const [submitError,setSubmitError]=useState('');
  useEffect(()=>{
    const queryInterest=new URLSearchParams(window.location.search).get('interest');
    if(queryInterest&&interests.includes(queryInterest)&&interestRef.current)interestRef.current.value=queryInterest;
  },[]);
  useEffect(()=>{if(review)reviewTitle.current?.focus();},[review]);
  useEffect(()=>{if(submitted)successTitle.current?.focus();},[submitted]);
  function reviewEnquiry(event:FormEvent<HTMLFormElement>){
    event.preventDefault();const data=new FormData(event.currentTarget);
    setReview({name:String(data.get('name')).trim(),email:String(data.get('email')).trim(),interest:String(data.get('interest')).trim(),message:String(data.get('message')).trim()});
    setCopyStatus('');
  }
  async function copy(){
    if(!review)return;
    try{await navigator.clipboard.writeText(`Name: ${review.name}\nEmail: ${review.email}\nInterested in: ${review.interest}\n\n${review.message}`);setCopyStatus('Enquiry copied.');}
    catch{setCopyStatus('Copy is unavailable. You can select and copy the preview text.');}
  }
  async function sendEnquiry(){
    const form=formRef.current;
    if(!form||isSubmitting)return;
    const payload=new URLSearchParams();
    new FormData(form).forEach((value,key)=>{
      if(typeof value==='string')payload.append(key,value);
    });
    setIsSubmitting(true);
    setSubmitError('');
    try{
      const response=await fetch(window.location.pathname,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:payload.toString()});
      if(!response.ok)throw new Error('Form submission failed.');
      setSubmitted(true);
    }catch{
      setSubmitError('We couldn’t send your enquiry. Please try again.');
    }finally{
      setIsSubmitting(false);
    }
  }
  return <WorldShell image="adlab" label="Start a conversation">
    <div className="contact-layout">
      <div className="contact-intro"><p className="world-kicker">CONTACT / EVERY IDEA STARTS SOMEWHERE</p><h1>Something<br/>on your<br/><em>horizon?</em></h1><p>A half-formed idea, a business challenge, or a story waiting to be told. We’d love to hear it.</p></div>
      <section className="contact-panel" aria-label="Project enquiry">
        <form ref={formRef} name="contact" method="POST" data-netlify="true" onSubmit={reviewEnquiry} hidden={review!==null}>
          <input type="hidden" name="form-name" value="contact" />
          <p className="world-kicker">TELL US WHAT YOU’RE THINKING</p>
          <div className="contact-fields"><label>Your name<input name="name" autoComplete="name" required maxLength={100} /></label><label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com"/></label></div>
          <label>What would you like to create?<select ref={interestRef} name="interest" required defaultValue=""><option value="" disabled>Choose a starting point</option><optgroup label="Software & AI Solutions">{labs.software.services.map(service=><option key={service.id}>{service.label}</option>)}</optgroup><optgroup label="Media Content Creation">{labs.ads.services.map(service=><option key={service.id}>{service.label}</option>)}</optgroup><option>Something else / Let’s explore</option></select></label>
          <label>A little about your idea<textarea name="message" required minLength={10} maxLength={5000} rows={4} placeholder="What are you hoping to build, change, or create?"/></label>
          <button type="submit" className="world-action">Review enquiry <ArrowUpRight size={18}/></button>
          <p className="contact-notice">Review your enquiry before sending it.</p>
        </form>
        {submitted?<div className="enquiry-success" role="status" aria-live="polite"><p className="world-kicker">ENQUIRY SENT</p><h2 ref={successTitle} tabIndex={-1}>Thanks for getting in touch.</h2><p>We’ve received your enquiry and will be in touch soon.</p></div>:review&&<div className="enquiry-review"><p className="world-kicker">ENQUIRY PREVIEW</p><h2 ref={reviewTitle} tabIndex={-1}>Here’s your starting point.</h2><dl><dt>Name</dt><dd>{review.name}</dd><dt>Email</dt><dd>{review.email}</dd><dt>Interested in</dt><dd>{review.interest}</dd><dt>Your idea</dt><dd className="enquiry-message">{review.message}</dd></dl><button type="button" className="world-action" onClick={sendEnquiry} disabled={isSubmitting}>{isSubmitting?'Sending enquiry…':'Send enquiry'} <ArrowUpRight size={18}/></button><button type="button" className="world-action" onClick={copy} disabled={isSubmitting}>{copyStatus==='Enquiry copied.'?<Check size={16}/>:<Copy size={16}/>} Copy enquiry</button><p className="contact-notice" role={submitError?'alert':'status'}>{submitError||copyStatus||'Your enquiry is ready to send.'}</p><button className="edit-enquiry" onClick={()=>setReview(null)} disabled={isSubmitting}><ArrowLeft size={14}/> Edit your enquiry</button></div>}
      </section>
    </div>
  </WorldShell>;
}
