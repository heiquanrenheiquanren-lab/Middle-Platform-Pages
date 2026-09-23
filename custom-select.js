(()=>{
  const ready='data-custom-select-ready';
  let openSelect=null;

  const close=select=>{
    if(!select)return;
    const wrapper=select.closest('.custom-select');
    wrapper?.classList.remove('is-open');
    wrapper?.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded','false');
    if(openSelect===select)openSelect=null;
  };

  const sync=select=>{
    const wrapper=select.closest('.custom-select');
    if(!wrapper)return;
    const selected=select.options[select.selectedIndex];
    const label=wrapper.querySelector('.custom-select-label');
    if(label)label.textContent=selected?.textContent?.trim()||'';
    wrapper.classList.toggle('is-placeholder',!select.value);
    wrapper.classList.toggle('is-disabled',select.disabled);
    wrapper.querySelectorAll('.custom-select-option').forEach(option=>option.classList.toggle('is-selected',Number(option.dataset.index)===select.selectedIndex));
  };

  const buildOptions=select=>{
    const wrapper=select.closest('.custom-select');
    const menu=wrapper?.querySelector('.custom-select-menu');
    if(!menu)return;
    menu.innerHTML='';
    [...select.options].forEach((option,index)=>{
      const item=document.createElement('button');
      item.type='button';
      item.className='custom-select-option';
      item.dataset.index=String(index);
      item.textContent=option.textContent.trim();
      item.disabled=option.disabled;
      item.classList.toggle('is-disabled',option.disabled);
      item.onclick=()=>{
        if(option.disabled)return;
        select.selectedIndex=index;
        select.dispatchEvent(new Event('input',{bubbles:true}));
        select.dispatchEvent(new Event('change',{bubbles:true}));
        sync(select);
        close(select);
      };
      menu.append(item);
    });
    sync(select);
  };

  const watchValueChange=(select,property)=>{
    const descriptor=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,property);
    if(!descriptor?.get||!descriptor?.set)return;
    Object.defineProperty(select,property,{
      configurable:true,
      enumerable:descriptor.enumerable,
      get(){return descriptor.get.call(this);},
      set(value){
        descriptor.set.call(this,value);
        sync(this);
      }
    });
  };

  const enhance=select=>{
    if(select.hasAttribute(ready)||select.multiple||select.dataset.nativeSelect==='true')return;
    const originalClasses=[...select.classList];
    const computed=getComputedStyle(select);
    const rect=select.getBoundingClientRect();
    const wrapper=document.createElement('div');
    wrapper.className='custom-select';
    originalClasses.forEach(name=>wrapper.classList.add(name));
    wrapper.style.setProperty('--ui-select-height',computed.height||'32px');
    if(rect.width>0&&!select.closest('.field,.purchase-create-field,.supplier-query-item'))wrapper.style.width=`${Math.round(rect.width)}px`;
    select.parentNode.insertBefore(wrapper,select);
    wrapper.append(select);
    select.setAttribute(ready,'');
    select.classList.add('custom-select-source');
    select.tabIndex=-1;
    watchValueChange(select,'value');
    watchValueChange(select,'selectedIndex');

    const trigger=document.createElement('button');
    trigger.type='button';
    trigger.className='custom-select-trigger';
    trigger.setAttribute('aria-haspopup','listbox');
    trigger.setAttribute('aria-expanded','false');
    trigger.innerHTML='<span class="custom-select-label"></span><span class="custom-select-arrow">⌄</span>';
    const menu=document.createElement('div');
    menu.className='custom-select-menu';
    menu.setAttribute('role','listbox');
    wrapper.append(trigger,menu);

    trigger.onclick=event=>{
      event.stopPropagation();
      if(select.disabled)return;
      if(openSelect&&openSelect!==select)close(openSelect);
      const opening=!wrapper.classList.contains('is-open');
      wrapper.classList.toggle('is-open',opening);
      trigger.setAttribute('aria-expanded',String(opening));
      openSelect=opening?select:null;
    };
    trigger.onkeydown=event=>{
      if(event.key==='Escape'){close(select);trigger.focus();}
      if(event.key==='Enter'||event.key===' '||event.key==='ArrowDown'){event.preventDefault();trigger.click();}
    };
    select.addEventListener('change',()=>sync(select));
    buildOptions(select);
  };

  const enhanceAll=root=>root.querySelectorAll?.(`select:not([${ready}])`).forEach(enhance);
  document.addEventListener('click',event=>{if(openSelect&&!openSelect.closest('.custom-select')?.contains(event.target))close(openSelect);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&openSelect)close(openSelect);});
  new MutationObserver(records=>{
    records.forEach(record=>{
      record.addedNodes.forEach(node=>{
        if(node.nodeType!==1)return;
        if(node.matches?.(`select:not([${ready}])`))enhance(node);
        enhanceAll(node);
      });
      if(record.type==='childList'&&record.target.tagName==='SELECT'&&record.target.hasAttribute(ready))buildOptions(record.target);
    });
  }).observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>enhanceAll(document));else enhanceAll(document);
  window.enhanceCustomSelects=()=>enhanceAll(document);
})();
