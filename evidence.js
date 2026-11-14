/* Media stays in memory. CookPath saves feedback, not the uploaded photo or clip. */
(() => {
  const {choose:L}=window.COOKPATH_I18N, A=window.COOKPATH_ACCOUNTS;
  const rules=window.COOKPATH_EVIDENCE_RULES || {};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let dialog,objectURL,selection=0,prepared=null,reviewing=false;
  const rule=id=>rules[id]||{kind:'none',checks:[]};
  function validateFile(file,kind){
    const image=/\.(jpe?g|png|webp|heic|heif)$/i,video=/\.(mp4|webm|mov)$/i;
    if(!file || !(kind==='photo'?image:video).test(file.name) || (file.type && !(kind==='photo'?/^image\/(jpeg|png|webp|heic|heif)$/:/^video\/(mp4|webm|quicktime)$/).test(file.type)))throw new Error('wrong_type');
    if(file.size>(kind==='photo'?15:25)*1024*1024)throw new Error('file_too_large');
  }
  function release(){if(objectURL)URL.revokeObjectURL(objectURL);objectURL=null;prepared=null;selection++;}
  function resultMarkup(review){
    if(!review)return '';
    return `<div class="evidence-feedback ${review.status==='approved'?'evidence-approved':'evidence-retry'}"><strong>${review.status==='approved'?L('AI review passed ✓','Η αξιολόγηση ΤΝ εγκρίθηκε ✓'):L('One more practice round','Μία ακόμη προσπάθεια')}</strong><p>${esc(L(review.feedback.feedback_en,review.feedback.feedback_el))}</p></div>`;
  }
  function card(task,review){
    const r=rule(task.id);
    return `<div class="evidence-check"><span class="eyebrow">${r.kind==='video'?L('Short clip · AI practice check','Σύντομο βίντεο · Έλεγχος εξάσκησης ΤΝ'):L('Photo · AI practice check','Φωτογραφία · Έλεγχος εξάσκησης ΤΝ')}</span><ul>${r.checks.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>${resultMarkup(review)}<button class="btn" data-evidence="${task.id}">${r.kind==='video'?L('Submit a short clip','Υποβολή σύντομου βίντεο'):L('Submit a photo','Υποβολή φωτογραφίας')}</button></div>`;
  }
  const errors={
    wrong_type:()=>L('Choose a photo (JPG, PNG or WebP), or the short video requested for this task. PDFs and documents are not accepted.','Επιλέξτε φωτογραφία (JPG, PNG ή WebP) ή το σύντομο βίντεο που ζητά η άσκηση. Δεν γίνονται δεκτά PDF ή έγγραφα.'),
    file_too_large:()=>L('Choose a photo under 15 MB or a video under 25 MB.','Επιλέξτε φωτογραφία έως 15 MB ή βίντεο έως 25 MB.'),
    video_length:()=>L('Use a clip between 3 and 12 seconds. A few slow repetitions are enough.','Χρησιμοποιήστε βίντεο 3–12 δευτερολέπτων. Αρκούν μερικές αργές επαναλήψεις.'),
    invalid_media:()=>L('This file could not be read. Try a JPG, PNG or WebP photo, or an MP4/WebM video.','Δεν ήταν δυνατή η ανάγνωση του αρχείου. Δοκιμάστε φωτογραφία JPG, PNG ή WebP ή βίντεο MP4/WebM.'),
    review_limit:()=>L('The review limit has been reached. Your progress is safe; please try again later.','Συμπληρώθηκε το όριο αξιολογήσεων. Η πρόοδός σας διατηρείται. Δοκιμάστε αργότερα.'),
    review_not_active:()=>L('AI review is not active yet. No evidence has been marked as passed.','Η αξιολόγηση ΤΝ δεν είναι ακόμη ενεργή. Κανένα αποδεικτικό δεν εγκρίθηκε.'),
    review_busy:()=>L('A review is already running. Please wait a moment before trying again.','Μια αξιολόγηση βρίσκεται ήδη σε εξέλιξη. Περιμένετε λίγο πριν δοκιμάσετε ξανά.'),
    sign_in_required:()=>L('Sign in again before submitting your practice.','Συνδεθείτε ξανά πριν υποβάλετε την εξάσκησή σας.'),
    account_changed:()=>L('Your account changed. Open the task again to continue.','Ο λογαριασμός σας άλλαξε. Ανοίξτε ξανά την άσκηση για να συνεχίσετε.'),
    task_locked:()=>L('Finish the preceding challenge before submitting this task.','Ολοκληρώστε την προηγούμενη πρόκληση πριν υποβάλετε αυτή την άσκηση.'),
    progress_refresh_failed:()=>L('Your AI review was saved. Open My account and refresh your progress to load it.','Η αξιολόγηση ΤΝ αποθηκεύτηκε. Ανοίξτε τον λογαριασμό σας και ανανεώστε την πρόοδο για να φορτωθεί.')
  };
  function message(text,error=false){const host=dialog.querySelector('#evidence-message');host.textContent=text;host.classList.toggle('evidence-error',error);}
  function frame(source){
    const width=source.videoWidth||source.naturalWidth,height=source.videoHeight||source.naturalHeight;
    if(!width||!height||width*height>40_000_000)throw new Error('invalid_media');
    const canvas=document.createElement('canvas'),scale=Math.min(1,1280/Math.max(width,height));
    canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);
    const context=canvas.getContext('2d');context.drawImage(source,0,0,canvas.width,canvas.height);
    let data;
    for(let quality=.8;quality>=.39;quality-=.1){data=canvas.toDataURL('image/jpeg',quality);if(data.length<=550_000)break;}
    if(data.length>550_000)throw new Error('file_too_large');return data;
  }
  function mediaEvent(media,event,action){
    return new Promise((resolve,reject)=>{
      const clean=()=>{clearTimeout(timer);media.removeEventListener(event,done);media.removeEventListener('error',fail);};
      const done=()=>{clean();resolve();},fail=()=>{clean();reject(new Error('invalid_media'));};
      const timer=setTimeout(fail,12000);media.addEventListener(event,done,{once:true});media.addEventListener('error',fail,{once:true});action();
    });
  }
  async function prepare(file,kind,url){
    if(kind==='photo'){
      const image=new Image();image.src=url;
      try{await image.decode();}catch{throw new Error('invalid_media');}
      return {frames:[frame(image)]};
    }
    const video=document.createElement('video');video.muted=true;video.playsInline=true;video.preload='auto';
    try{
      await mediaEvent(video,'loadedmetadata',()=>{video.src=url;video.load();});
      const duration=video.duration;
      if(!Number.isFinite(duration)||duration<3||duration>12)throw new Error('video_length');
      const frames=[];
      for(let index=0;index<5;index++){
        await mediaEvent(video,'seeked',()=>{video.currentTime=.1+(duration-.2)*index/4;});frames.push(frame(video));
      }
      return {frames,duration};
    }finally{video.removeAttribute('src');video.load();}
  }
  function open(task,{onComplete=()=>{}}={}){
    if(!A.canWrite){A.open();return;}
    const r=rule(task.id);if(r.kind==='none')return;
    if(!dialog){dialog=document.createElement('dialog');dialog.className='evidence-dialog';dialog.setAttribute('aria-labelledby','evidence-title');document.body.append(dialog);dialog.addEventListener('close',release);}
    release();reviewing=false;
    const isVideo=r.kind==='video',accept=isVideo?'video/mp4,video/webm,video/quicktime':'image/jpeg,image/png,image/webp,image/heic,image/heif';
    dialog.innerHTML=`<div class="evidence-heading"><div><span class="eyebrow">${L('Your practice, made visible','Η εξάσκησή σας στην πράξη')}</span><h2 id="evidence-title">${esc(task.title)}</h2></div><button class="btn outline" id="evidence-close" aria-label="${L('Close practice review','Κλείσιμο αξιολόγησης εξάσκησης')}">×</button></div><p class="evidence-intro">${isVideo?L('A 3–12 second clip is enough. Set the camera down before starting. AI checks five snapshots from your clip; audio is not sent.','Αρκεί ένα βίντεο 3–12 δευτερολέπτων. Στηρίξτε την κάμερα πριν ξεκινήσετε. Η ΤΝ ελέγχει πέντε στιγμιότυπα. Δεν αποστέλλεται ήχος.'):L('One clear photo is enough. Show the result or the stationary hand position requested below.','Αρκεί μία καθαρή φωτογραφία. Δείξτε το αποτέλεσμα ή την ακίνητη θέση του χεριού που ζητείται παρακάτω.')}</p><div class="evidence-criteria"><h3>${L('What the AI will look for','Τι θα ελέγξει η ΤΝ')}</h3><ul>${r.checks.map(c=>`<li>${esc(c)}</li>`).join('')}</ul></div><div class="evidence-file-actions"><label class="btn secondary">${isVideo?L('Record a clip','Εγγραφή βίντεο'):L('Take a photo','Λήψη φωτογραφίας')}<input class="evidence-file-input" type="file" accept="${accept}" capture="environment" aria-label="${isVideo?L('Record practice video','Εγγραφή βίντεο εξάσκησης'):L('Take practice photo','Λήψη φωτογραφίας εξάσκησης')}"></label><label class="btn outline">${isVideo?L('Upload a video','Μεταφόρτωση βίντεο'):L('Upload a photo','Μεταφόρτωση φωτογραφίας')}<input class="evidence-file-input" type="file" accept="${accept}" aria-label="${isVideo?L('Choose practice video','Επιλογή βίντεο εξάσκησης'):L('Choose practice photo','Επιλογή φωτογραφίας εξάσκησης')}"></label></div><p class="evidence-small">${isVideo?L('MP4, WebM or MOV · up to 25 MB · no documents','MP4, WebM ή MOV · έως 25 MB · χωρίς έγγραφα'):L('JPG, PNG or WebP · up to 15 MB · no PDFs','JPG, PNG ή WebP · έως 15 MB · όχι PDF')}</p><div id="evidence-preview"></div><p id="evidence-message" role="status" aria-live="polite"></p><p class="evidence-small">${L('Your photo or video snapshots are sent to OpenAI for review. CookPath saves the feedback, not the media. Only include your practice. AI feedback cannot establish food safety, taste or internal doneness.','Η φωτογραφία ή τα στιγμιότυπα του βίντεο αποστέλλονται στην OpenAI για αξιολόγηση. Το CookPath αποθηκεύει τα σχόλια, όχι το υλικό. Συμπεριλάβετε μόνο την εξάσκησή σας. Η ΤΝ δεν μπορεί να επιβεβαιώσει ασφάλεια τροφίμων, γεύση ή εσωτερικό ψήσιμο.')}</p><button class="btn" id="evidence-submit" disabled>${L('Send for AI review','Αποστολή για αξιολόγηση ΤΝ')}</button><div id="evidence-result"></div>`;
    dialog.querySelector('#evidence-close').onclick=()=>dialog.close();
    const inputs=[...dialog.querySelectorAll('input[type=file]')],submit=dialog.querySelector('#evidence-submit');
    inputs.forEach(input=>input.onchange=async()=>{
      if(reviewing)return;
      release();const stamp=selection,file=input.files?.[0];submit.disabled=true;dialog.querySelector('#evidence-result').innerHTML='';
      const preview=dialog.querySelector('#evidence-preview');preview.replaceChildren();if(!file)return;
      try{
        validateFile(file,r.kind);objectURL=URL.createObjectURL(file);const url=objectURL;
        message(L('Preparing your practice…','Προετοιμασία της εξάσκησής σας…'));
        const result=await prepare(file,r.kind,url);if(stamp!==selection||!dialog.open)return;
        prepared=result;const media=document.createElement(isVideo?'video':'img');media.src=url;
        if(isVideo){media.controls=true;media.playsInline=true;}else media.alt=L('Your selected practice photo','Η επιλεγμένη φωτογραφία εξάσκησης');
        preview.append(media);message(L('Ready for review. A helpful next step is always included if you need another try.','Έτοιμο για αξιολόγηση. Αν χρειάζεται νέα προσπάθεια, θα λάβετε χρήσιμες οδηγίες.'));submit.disabled=false;
      }catch(error){if(stamp!==selection)return;release();message((errors[error.message]||errors.invalid_media)(),true);}
    });
    submit.onclick=async()=>{
      if(!prepared||reviewing)return;const stamp=selection,payload={taskId:task.id,kind:r.kind,language:window.COOKPATH_I18N.language,...prepared};
      reviewing=true;submit.disabled=true;inputs.forEach(i=>i.disabled=true);message(L('AI is checking your practice…','Η ΤΝ ελέγχει την εξάσκησή σας…'));
      try{
        const verdict=await A.reviewEvidence(payload);if(stamp!==selection||!dialog.open)return;
        if(!['approved','retry'].includes(verdict?.status)||!verdict.result)throw new Error('review_unavailable');
        dialog.querySelector('#evidence-result').innerHTML=resultMarkup({status:verdict.status,feedback:verdict.result});
        message(verdict.status==='approved'?L('Task completed and saved to your account.','Η άσκηση ολοκληρώθηκε και αποθηκεύτηκε στον λογαριασμό σας.'):L('Your task is still open. Follow the feedback and submit another attempt whenever you are ready.','Η άσκηση παραμένει ανοιχτή. Ακολουθήστε τα σχόλια και υποβάλετε νέα προσπάθεια όταν είστε έτοιμοι.'));
        if(verdict.status==='approved'){onComplete();prepared=null;inputs.forEach(i=>i.disabled=true);}
        else {release();dialog.querySelector('#evidence-preview').replaceChildren();inputs.forEach(i=>{i.disabled=false;i.value='';});}
      }catch(error){if(stamp===selection&&dialog.open){message((errors[error.message]||(()=>L('The review could not finish. Your task was not marked as passed. Try again shortly.','Η αξιολόγηση δεν ολοκληρώθηκε. Η άσκηση δεν εγκρίθηκε. Δοκιμάστε ξανά σε λίγο.')))(),true);inputs.forEach(i=>i.disabled=false);submit.disabled=!prepared;}}
      finally{reviewing=false;}
    };
    if(!dialog.open)dialog.showModal();
  }
  window.addEventListener('cookpath-account-changed',()=>{release();dialog?.close();});
  window.COOKPATH_EVIDENCE={rule,card,resultMarkup,open,validateFile};
})();
