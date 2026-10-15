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
    if(select.dataset.customSelectAddable==='true'&&!select.disabled){
      const addLabel=select.dataset.customSelectAddLabel||'新增选项';
      const option=document.createElement('button');
      option.type='button';
      option.className='custom-select-option is-add-option';
      option.textContent=`＋ ${addLabel}`;
      option.addEventListener('click',event=>{
        event.preventDefault();
        event.stopPropagation();
        let editor=menu.querySelector('.custom-select-add-editor');
        if(!editor){
          const name=addLabel.replace(/^新增/,'')||'选项';
          editor=document.createElement('div');
          editor.className='custom-select-add-editor';
          editor.innerHTML=`<input type="text" maxlength="30" placeholder="${select.dataset.customSelectAddPlaceholder||`请输入${name}名称`}"><button type="button" class="custom-select-add-confirm" aria-label="确认新增${name}">✓</button><button type="button" class="custom-select-add-cancel" aria-label="取消新增${name}">×</button><p class="custom-select-add-error" aria-live="polite"></p>`;
          menu.append(editor);
          const input=editor.querySelector('input');
          const error=editor.querySelector('.custom-select-add-error');
          const closeEditor=()=>{editor.hidden=true;input.value='';error.textContent='';wrapper.querySelector('.custom-select-trigger')?.focus();};
          const save=()=>{
            const value=input.value.trim();
            if(!value){error.textContent=`请输入${name}名称`;input.focus();return;}
            const existing=[...select.options].find(item=>item.value===value||item.textContent.trim()===value);
            const isNew=!existing;
            if(existing)select.value=existing.value;
            else{const next=document.createElement('option');next.value=value;next.textContent=value;select.append(next);select.value=value;}
            select.dispatchEvent(new Event('input',{bubbles:true}));
            select.dispatchEvent(new Event('change',{bubbles:true}));
            select.dispatchEvent(new CustomEvent('ui-select-option-added',{bubbles:true,detail:{value:value,isNew:isNew}}));
            buildOptions(select);
            close(select);
          };
          editor.querySelector('.custom-select-add-confirm').addEventListener('click',event=>{event.stopPropagation();save();});
          editor.querySelector('.custom-select-add-cancel').addEventListener('click',event=>{event.stopPropagation();closeEditor();});
          input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();save();}if(event.key==='Escape'){event.preventDefault();closeEditor();}});
        }
        editor.hidden=false;
        wrapper.classList.add('is-open');
        wrapper.querySelector('.custom-select-trigger')?.setAttribute('aria-expanded','true');
        requestAnimationFrame(()=>editor.querySelector('input')?.focus());
      });
      menu.append(option);
    }
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

  const enhanceMultiClear=root=>{
    root.querySelectorAll?.('.multi').forEach(box=>{
      if(box.dataset.multiClearReady)return;
      box.dataset.multiClearReady='1';
      const trigger=box.querySelector('.multi-trigger[data-trigger]');
      const menu=box.querySelector('[data-menu]');
      if(!trigger||!menu)return;
      const clear=document.createElement('button');
      clear.type='button';
      clear.className='multi-clear';
      clear.setAttribute('aria-label','清空');
      clear.textContent='×';
      clear.addEventListener('click',event=>{
        event.stopPropagation();
        menu.querySelectorAll('input').forEach(input=>{input.checked=false;});
        menu.dispatchEvent(new Event('change',{bubbles:true}));
      });
      box.append(clear);
    });
  };
  const createUiMultiSelect=config=>{
    const box=typeof config.root==='string'?document.querySelector(config.root):config.root;
    if(!box)return null;
    const trigger=box.querySelector('.multi-trigger[data-trigger]');
    const menu=box.querySelector('[data-menu]');
    if(!trigger||!menu)return null;
    const state={options:config.options||[],values:[...(config.values||[])],placeholder:config.placeholder||'请选择',onChange:config.onChange};
    const sync=()=>{
      state.values=[...menu.querySelectorAll('input:checked')].map(input=>input.value);
      trigger.textContent=state.values.length?state.values.join('、'):state.placeholder;
      trigger.classList.toggle('has-value',state.values.length>0);
      box.classList.toggle('has-value',state.values.length>0);
      state.onChange?.([...state.values]);
    };
    const render=()=>{
      menu.innerHTML='';
      state.options.forEach(option=>{
        const label=document.createElement('label');
        const input=document.createElement('input');
        const text=document.createElement('span');
        input.type='checkbox';input.value=option;input.checked=state.values.includes(option);text.textContent=option;
        label.append(input,text);menu.append(label);
      });
      sync();
    };
    if(!box.dataset.uiMultiSelectReady){
      box.dataset.uiMultiSelectReady='1';
      trigger.addEventListener('click',event=>{
        event.stopPropagation();
        document.querySelectorAll('.ui-multi-select .dropdown.show').forEach(dropdown=>{if(dropdown!==menu)dropdown.classList.remove('show');});
        document.querySelectorAll('.ui-multi-select .multi-trigger.open').forEach(item=>{if(item!==trigger)item.classList.remove('open');});
        const opening=!menu.classList.contains('show');
        menu.classList.toggle('show',opening);trigger.classList.toggle('open',opening);trigger.setAttribute('aria-expanded',String(opening));
      });
      menu.addEventListener('change',sync);
    }
    render();
    return {getValues:()=>[...state.values],setValues:values=>{state.values=[...(values||[])];render();}};
  };
  const enhanceInputClear=root=>{
    root.querySelectorAll?.('input.control').forEach(input=>{
      if(input.dataset.inputClearReady)return;
      if(['date','number','hidden','file','range','checkbox','radio'].includes(input.type))return;
      if(input.closest('.date-group')||input.closest('.tag-input')||input.closest('.input-clear'))return;
      input.dataset.inputClearReady='1';
      const wrap=document.createElement('span');
      wrap.className='input-clear';
      input.parentNode.insertBefore(wrap,input);
      wrap.append(input);
      const clear=document.createElement('button');
      clear.type='button';
      clear.className='input-clear-btn';
      clear.setAttribute('aria-label','清空');
      clear.textContent='×';
      clear.addEventListener('click',()=>{
        input.value='';
        input.dispatchEvent(new Event('input',{bubbles:true}));
        input.dispatchEvent(new Event('change',{bubbles:true}));
        input.focus();
      });
      wrap.append(clear);
    });
  };
  const enhanceClearAll=root=>{enhanceMultiClear(root);enhanceInputClear(root);};
  const enhanceAll=root=>{root.querySelectorAll?.(`select:not([${ready}])`).forEach(enhance);enhanceClearAll(root);};
  document.addEventListener('click',event=>{if(openSelect&&!openSelect.closest('.custom-select')?.contains(event.target))close(openSelect);if(!event.target.closest('.ui-multi-select')){document.querySelectorAll('.ui-multi-select .dropdown.show').forEach(dropdown=>dropdown.classList.remove('show'));document.querySelectorAll('.ui-multi-select .multi-trigger.open').forEach(trigger=>{trigger.classList.remove('open');trigger.setAttribute('aria-expanded','false');});}});
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
  window.createUiMultiSelect=createUiMultiSelect;
})();
