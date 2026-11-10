(() => {
  const tours=window.COOKPATH_TOURS;
  const dialog=document.querySelector('#tour-dialog');
  if(!tours||!dialog||typeof dialog.showModal!=='function')return;
  const video=dialog.querySelector('video'),title=dialog.querySelector('#tour-title');
  const note=dialog.querySelector('#tour-note'),credits=dialog.querySelector('#tour-credits');
  const error=dialog.querySelector('#tour-error');
  const {choose,translate,greek}=window.COOKPATH_I18N;
  let greekCaptions;
  function setCaptions(name,scenes){
    if(!greek||typeof VTTCue!=='function')return;
    greekCaptions ||= video.addTextTrack('captions','Ελληνικά','el');
    greekCaptions.mode='showing';
    for(const cue of Array.from(greekCaptions.cues||[]))greekCaptions.removeCue(cue);
    scenes.forEach((scene,index)=>{
      const heading=scene.kind==='place'?'ΤΟΠΟΣ':'ΠΙΑΤΟ';
      const cue=new VTTCue(index*2.5,(index+1)*2.5,`${name} · ${heading} ${Math.floor(index/2)+1}/5\n${translate(scene.caption)}`);
      cue.line=1;
      greekCaptions.addCue(cue);
    });
  }
  const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el};
  const link=(url,text)=>{const a=make('a','',text);a.href=url;a.target='_blank';a.rel='noopener';return a};
  let trigger;
  document.querySelectorAll('.cuisine').forEach(card=>{
    const heading=card.querySelector('h3');
    const name=heading.textContent;
    const id=card.dataset.cuisine,scenes=tours[id];
    if(!scenes)return;
    const button=make('button','cuisine-tour');
    button.type='button';
    button.setAttribute('aria-haspopup','dialog');
    button.setAttribute('aria-label',choose(`Watch the ${name} cuisine video`,`Δείτε το βίντεο γαστρονομίας · ${name}`));
    const thumbnail=make('span','tour-thumb');
    const image=make('img');
    image.src=`assets/cuisines/${id}.jpg`;
    image.alt='';image.loading='lazy';image.decoding='async';image.width=70;image.height=42;
    const icon=make('span','','▶');icon.setAttribute('aria-hidden','true');
    thumbnail.append(image,icon);
    const copy=make('span','tour-button-copy',choose('Watch the postcard','Δείτε την καρτ ποστάλ'));
    copy.append(make('small','',choose('5 places · 5 dishes','5 τόποι · 5 πιάτα')));
    button.append(thumbnail,copy);
    const header=make('div','cuisine-card-header');
    heading.replaceWith(header);
    header.append(heading,button);
    button.addEventListener('click',()=>{
      trigger=button;
      title.textContent=choose(`A taste of ${name}`,`Γεύσεις και εικόνες · ${name}`);
      note.textContent=choose('25 seconds · 5 places · 5 dishes · Silent photo montage','25 δευτερόλεπτα · 5 τόποι · 5 πιάτα · Φωτογραφικό μοντάζ χωρίς ήχο');
      credits.replaceChildren(...scenes.map(scene=>{
        const item=make('li');
        item.append(`${translate(scene.caption)} — ${scene.author || choose(scene.credit,'Φωτογραφία που δόθηκε στο CookPath')}.`);
        if(scene.source)item.append(' ',link(scene.source,choose('Original photo','Πρωτότυπη φωτογραφία')));
        if(scene.license)item.append(' · ',scene.licenseUrl?link(scene.licenseUrl,scene.license):scene.license);
        return item;
      }));
      dialog.querySelector('.tour-credits').open=false;
      error.hidden=true;
      video.poster=`assets/cuisines/${id}.jpg`;
      video.src=`assets/cuisines/${id}.mp4`;
      setCaptions(name,scenes);
      dialog.showModal();
      if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)video.play().catch(()=>{});
    });
  });
  video.addEventListener('error',()=>{if(dialog.open)error.hidden=false});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
  dialog.addEventListener('close',()=>{
    video.pause();
    video.removeAttribute('src');
    video.load();
    trigger?.focus({preventScroll:true});
  });
})();
