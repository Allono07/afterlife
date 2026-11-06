"use client";
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {WorldShell} from './WorldShell';
import {labs} from './content';
import {WorldObject} from './WorldObject';
import {contactEmail,discoveryHref,trackConversion,whatsappHref} from '@/lib/contact';

const interests=[...labs.software.services,...labs.ads.services].map(service=>service.label);
interests.push('Free workflow mini-audit','Combined software and content project');
export function ContactExperience(){
  const interestRef=useRef<HTMLSelectElement>(null);
  const successTitle=useRef<HTMLHeadingElement>(null);
  const [submitted,setSubmitted]=useState(false);
  const [isSubmitting,setIsSubmitting]=useState(false);
  const [submitError,setSubmitError]=useState('');
  useEffect(()=>{
    const queryInterest=new URLSearchParams(window.location.search).get('interest');
    if(queryInterest&&interests.includes(queryInterest)&&interestRef.current)interestRef.current.value=queryInterest;
  },[]);
  useEffect(()=>{if(submitted)successTitle.current?.focus();},[submitted]);
  async function sendEnquiry(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(isSubmitting)return;
    const payload=new URLSearchParams();
    const formData=new FormData(event.currentTarget);
    if(!String(formData.get('email')||'').trim()&&!String(formData.get('whatsapp')||'').trim()){
      setSubmitError('Add an email address or WhatsApp number so we can reply.');
      return;
    }
    formData.forEach((value,key)=>{
      if(typeof value==='string')payload.append(key,value);
    });
    setIsSubmitting(true);
    setSubmitError('');
    try{
      const response=await fetch(window.location.pathname,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:payload.toString()});
      if(!response.ok)throw new Error('Form submission failed.');
      setSubmitted(true);
      trackConversion('form_submit','contact_enquiry');
    }catch{
      setSubmitError('We couldn’t send your enquiry. Please try again.');
    }finally{
      setIsSubmitting(false);
    }
  }
  return <WorldShell image="@contact.webp" label="Start a conversation">
    <div className="contact-layout">
      <div className="contact-intro"><p className="world-kicker">CONTACT / EVERY IDEA STARTS SOMEWHERE</p><h1>Something on <em>your horizon?</em></h1><p>A business challenge, a task you’d like to automate, or a product idea. Tell us what you’re working through and we’ll get back to you.</p><div className="contact-quick-links"><a href={discoveryHref} target="_blank" rel="noopener noreferrer" onClick={()=>{trackConversion('booking_click','contact_page_whatsapp');trackConversion('whatsapp_click','contact_page');}}>Arrange a free 20-min call</a><a href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={()=>trackConversion('whatsapp_click','contact_page')}>WhatsApp</a><a href={`mailto:${contactEmail}`} onClick={()=>trackConversion('email_click','contact_page')}>{contactEmail}</a></div></div>
      <section className="contact-panel" aria-label="Project enquiry">
        {!submitted&&<form name="contact" method="POST" data-netlify="true" onSubmit={sendEnquiry}>
          <input type="hidden" name="form-name" value="contact" />
          <p className="world-kicker">TELL US WHAT YOU’RE THINKING</p>
          <div className="contact-fields"><label>Your name<input name="name" autoComplete="name" required maxLength={100} /></label><label>Email address <span className="field-hint">or WhatsApp number</span><input name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com"/><input name="whatsapp" type="tel" autoComplete="tel" maxLength={32} placeholder="WhatsApp number" aria-label="WhatsApp number"/></label></div>
          <label>What would you like to create?<select ref={interestRef} name="interest" required defaultValue=""><option value="" disabled>Choose a starting point</option><optgroup label="Software & AI Solutions">{labs.software.services.map(service=><option key={service.id}>{service.label}</option>)}</optgroup><optgroup label="Media Content Creation">{labs.ads.services.map(service=><option key={service.id}>{service.label}</option>)}</optgroup><option>Free workflow mini-audit</option><option>Combined software and content project</option><option>Something else / Let’s explore</option></select></label>
          <label>A little about your idea<textarea name="message" required minLength={10} maxLength={5000} rows={4} placeholder="What are you hoping to build, change, or create?"/></label>
          <button type="submit" className="world-action" disabled={isSubmitting}>{isSubmitting?'Sending enquiry…':'Send enquiry'} </button>
          {submitError&&<p className="contact-notice" role="alert">{submitError}</p>}
        </form>}
        {submitted&&<div className="enquiry-success" role="status" aria-live="polite">
          <p className="world-kicker">ENQUIRY SENT</p>
          <h2 ref={successTitle} tabIndex={-1}>Thanks for getting in touch.</h2>
          <p>We’ve received your enquiry and will be in touch soon.</p>
        </div>}
      </section>
      <div className="contact-location"><WorldObject kind="india"/><div className="location-caption"><div><span>OUR COORDINATES</span><strong>Bengaluru, Karnataka, IN</strong></div><a href="https://www.openstreetmap.org/?mlat=12.9716&mlon=77.5946#map=12/12.9716/77.5946" target="_blank" rel="noopener noreferrer" aria-label="View Bengaluru on OpenStreetMap"><ArrowUpRight/></a></div></div>
    </div>
  </WorldShell>;
}
