import{r as m,c as K,a1 as be,o as he,f as B,k as _,e as M,X as we,g as e,y as o,j as d,x as a,V as h,Y as ke,R,S as z,J as p,I as r,$ as Q,u as v,a2 as ee,_ as Ce,a3 as Ve,F as xe,a4 as Me,L as De,a5 as $e,a6 as Te,a7 as Be,a8 as Ae,a0 as D}from"./element-plus-D9U92kps.js";import{f,s as w}from"./index-Bk0e3mkj.js";import{_ as Se}from"./_plugin-vue_export-helper-DlAUqK2U.js";const Ie={class:"monitoring"},Fe={class:"stats-header"},Ue={class:"stats-content"},Re={class:"stats-label"},ze={class:"filter-bar"},Ee={class:"card-header"},Le={class:"header-left"},Ne={class:"header-actions"},Pe={class:"card-header"},qe={class:"header-left"},He={class:"header-actions"},Oe={class:"camera-preview"},Xe={class:"camera-placeholder large"},je={class:"camera-info"},Je={class:"camera-controls"},We={class:"control-group"},Ye={class:"control-group"},Ze={class:"dialog-footer"},Ge={name:"Monitoring"},Ke=Object.assign(Ge,{setup(Qe){const C=m(!1),s=m([]),i=m([]),A=m(!1),k=m(null),V=m(!1),g=m({name:"",location:"",type:"海康威视球机"}),S=m(null),te=["海康威视球机","大华枪机","海康威视枪机","大华球机","萤石云摄像头"],le={name:[{required:!0,message:"请输入设备名称",trigger:"blur"},{pattern:/^IPC-[A-Z]\d-\d{2}$/,message:"设备名称格式应为 IPC-X0-00",trigger:"blur"}],location:[{required:!0,message:"请输入安装位置",trigger:"blur"}],type:[{required:!0,message:"请选择设备类型",trigger:"change"}]},E=m(""),ae=m(f.monitoring.areas);m(f.monitoring.inspectionTasks);const $=K(()=>i.value[0]),ne=K(()=>[{title:"设备总数",value:s.value.length,percentage:Math.round(s.value.filter(n=>n.status==="在线").length/s.value.length*100),label:"在线率",type:"primary",color:"#409EFF"},{title:"设备健康度",value:f.monitoring.stats.deviceHealth+"%",percentage:f.monitoring.stats.deviceHealth,label:"健康评分",type:"success",color:"#67C23A"},{title:"告警统计",value:i.value.length,percentage:100-Math.round(i.value.filter(n=>n.level==="严重").length/i.value.length*100),label:"告警处理率",type:"warning",color:"#E6A23C"},{title:"维护计划",value:f.monitoring.stats.maintenanceRate+"%",percentage:f.monitoring.stats.maintenanceRate,label:"计划完成率",type:"info",color:"#909399"}]),I=()=>{C.value=!0;try{s.value=[...f.monitoring.cameras],i.value=[...f.monitoring.alarms],w.setMonitoringData(s.value,i.value),C.value=!1}catch(n){console.error("获取监控数据失败:",n),h.error("获取监控数据失败"),C.value=!1}},L=n=>n==="在线"?"success":"danger",N=n=>({严重:"danger",警告:"warning",提示:"info"})[n],oe=n=>{n?s.value=f.monitoring.cameras.filter(t=>t.location.startsWith(n)):s.value=[...f.monitoring.cameras]};be(()=>{I()}),he(()=>{I()});const P=()=>{I(),h.success("刷新成功")},se=n=>{k.value={...n},A.value=!0},re=n=>{D.confirm(`确认对设备 ${n.name} 进行维护？`,"维护确认",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(()=>{const t={...n,lastMaintenance:new Date().toISOString().split("T")[0]};s.value=s.value.map(T=>T.id===n.id?t:T),w.setMonitoringData(s.value,i.value),h.success("维护记录已更新")}).catch(()=>{})},ie=n=>{D.confirm(`确认删除设备 ${n.name}？`,"删除确认",{confirmButtonText:"确定",cancelButtonText:"取消",type:"danger"}).then(()=>{s.value=s.value.filter(t=>t.id!==n.id),w.setMonitoringData(s.value,i.value),h.success("设备已删除")}).catch(()=>{})},ue=n=>{D.confirm(`确认处理告警 "${n.title}"？`,"处理确认",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(()=>{i.value=i.value.filter(t=>t.id!==n.id),w.setMonitoringData(s.value,i.value),h.success("告警已处理")}).catch(()=>{})},de=n=>{i.value=i.value.filter(t=>t.id!==n.id),w.setMonitoringData(s.value,i.value),h.success("告警已忽略")},ce=n=>{D.alert(`
    <p><strong>告警内容：</strong>${n.content}</p>
    <p><strong>位置：</strong>${n.location}</p>
    <p><strong>时间：</strong>${n.time}</p>
    <p><strong>类型：</strong>${n.type}</p>
    <p><strong>告警次数：</strong>${n.count}</p>
    `,`告警详情 - ${n.title}`,{dangerouslyUseHTMLString:!0,confirmButtonText:"关闭"})},pe=()=>{D.confirm("确认清空所有已处理的告警记录？","清空确认",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(()=>{i.value=i.value.filter(n=>n.status!=="processed"),w.setMonitoringData(s.value,i.value),h.success("已清空处理记录")}).catch(()=>{})},me=()=>{g.value={name:"",location:"",type:"海康威视球机"},V.value=!0},ve=async()=>{S.value&&await S.value.validate(n=>{if(n){const t={id:Date.now(),...g.value,status:"在线",lastMaintenance:new Date().toISOString().split("T")[0]};s.value=[t,...s.value],w.setMonitoringData(s.value,i.value),h.success("添加成功"),V.value=!1}})};return(n,t)=>{var Y;const T=d("el-alert"),y=d("el-tag"),fe=d("el-progress"),F=d("el-card"),ge=d("el-col"),_e=d("el-row"),q=d("el-option"),H=d("el-select"),x=d("el-icon"),u=d("el-button"),c=d("el-table-column"),O=d("el-table"),X=d("el-button-group"),j=d("el-dialog"),J=d("el-input"),U=d("el-form-item"),ye=d("el-form"),W=ke("loading");return _(),B("div",Ie,[$.value?(_(),M(T,{key:0,title:$.value.title,description:$.value.content,type:N($.value.level),"show-icon":"",closable:!1,class:"alert-banner"},null,8,["title","description","type"])):we("",!0),e(_e,{gutter:20,class:"stats-row"},{default:a(()=>[(_(!0),B(R,null,z(ne.value,l=>(_(),M(ge,{span:6,key:l.title},{default:a(()=>[e(F,{class:"stats-card"},{header:a(()=>[o("div",Fe,[o("span",null,p(l.title),1),e(y,{type:l.type},{default:a(()=>[r(p(l.value),1)]),_:2},1032,["type"])])]),default:a(()=>[o("div",Ue,[e(fe,{type:"dashboard",percentage:l.percentage,color:l.color},null,8,["percentage","color"]),o("div",Re,p(l.label),1)])]),_:2},1024)]),_:2},1024))),128))]),_:1}),o("div",ze,[e(H,{modelValue:E.value,"onUpdate:modelValue":t[0]||(t[0]=l=>E.value=l),placeholder:"选择区域",clearable:"",class:"area-select",onChange:oe},{default:a(()=>[(_(!0),B(R,null,z(ae.value,l=>(_(),M(q,{key:l.value,label:l.label,value:l.value},null,8,["label","value"]))),128))]),_:1},8,["modelValue"])]),e(F,{class:"camera-card"},{header:a(()=>[o("div",Ee,[o("div",Le,[t[7]||(t[7]=o("span",{class:"title"},"监控点位",-1)),e(y,{type:"success"},{default:a(()=>[r(p(s.value.filter(l=>l.status==="在线").length)+" 在线",1)]),_:1}),e(y,{type:"danger"},{default:a(()=>[r(p(s.value.filter(l=>l.status==="离线").length)+" 离线",1)]),_:1})]),o("div",Ne,[e(u,{type:"primary",link:"",onClick:P},{default:a(()=>[e(x,null,{default:a(()=>[e(v(ee))]),_:1}),t[8]||(t[8]=r("刷新 "))]),_:1}),e(u,{type:"primary",onClick:me},{default:a(()=>[e(x,null,{default:a(()=>[e(v(Ce))]),_:1}),t[9]||(t[9]=r("添加监控点 "))]),_:1})])])]),default:a(()=>[Q((_(),M(O,{data:s.value,style:{width:"100%"},size:"large",border:""},{default:a(()=>[e(c,{prop:"name",label:"监控点名称","min-width":"180"}),e(c,{prop:"location",label:"位置",width:"150"}),e(c,{prop:"type",label:"设备类型",width:"150"}),e(c,{prop:"status",label:"状态",width:"100"},{default:a(({row:l})=>[e(y,{type:L(l.status)},{default:a(()=>[r(p(l.status),1)]),_:2},1032,["type"])]),_:1}),e(c,{prop:"lastMaintenance",label:"最后维护时间",width:"180"}),e(c,{label:"操作",width:"180",fixed:"right"},{default:a(({row:l})=>[e(u,{type:"primary",link:"",onClick:b=>se(l)},{default:a(()=>t[10]||(t[10]=[r("查看")])),_:2},1032,["onClick"]),e(u,{type:"warning",link:"",onClick:b=>re(l)},{default:a(()=>t[11]||(t[11]=[r("维护")])),_:2},1032,["onClick"]),e(u,{type:"danger",link:"",onClick:b=>ie(l)},{default:a(()=>t[12]||(t[12]=[r("删除")])),_:2},1032,["onClick"])]),_:1})]),_:1},8,["data"])),[[W,C.value]])]),_:1}),e(F,{class:"alarm-card"},{header:a(()=>[o("div",Pe,[o("div",qe,[t[13]||(t[13]=o("span",{class:"title"},"告警信息",-1)),e(y,{type:"danger"},{default:a(()=>[r(p(i.value.filter(l=>l.level==="严重").length)+" 严重",1)]),_:1}),e(y,{type:"warning"},{default:a(()=>[r(p(i.value.filter(l=>l.level==="警告").length)+" 警告",1)]),_:1})]),o("div",He,[e(u,{type:"primary",link:"",onClick:P},{default:a(()=>[e(x,null,{default:a(()=>[e(v(ee))]),_:1}),t[14]||(t[14]=r("刷新 "))]),_:1}),e(u,{type:"danger",link:"",onClick:pe},{default:a(()=>[e(x,null,{default:a(()=>[e(v(Ve))]),_:1}),t[15]||(t[15]=r("清空已处理 "))]),_:1})])])]),default:a(()=>[Q((_(),M(O,{data:i.value,style:{width:"100%"},size:"large",border:""},{default:a(()=>[e(c,{prop:"title",label:"告警标题","min-width":"180"}),e(c,{prop:"content",label:"告警内容","min-width":"300","show-overflow-tooltip":""}),e(c,{prop:"level",label:"级别",width:"100"},{default:a(({row:l})=>[e(y,{type:N(l.level)},{default:a(()=>[r(p(l.level),1)]),_:2},1032,["type"])]),_:1}),e(c,{prop:"location",label:"位置",width:"120"}),e(c,{prop:"time",label:"时间",width:"180"}),e(c,{prop:"type",label:"类型",width:"120"}),e(c,{prop:"count",label:"次数",width:"80",align:"right"}),e(c,{label:"操作",width:"180",fixed:"right"},{default:a(({row:l})=>[e(u,{type:"primary",link:"",onClick:b=>ue(l)},{default:a(()=>t[16]||(t[16]=[r("处理")])),_:2},1032,["onClick"]),e(u,{type:"success",link:"",onClick:b=>de(l)},{default:a(()=>t[17]||(t[17]=[r("忽略")])),_:2},1032,["onClick"]),e(u,{type:"info",link:"",onClick:b=>ce(l)},{default:a(()=>t[18]||(t[18]=[r("详情")])),_:2},1032,["onClick"])]),_:1})]),_:1},8,["data"])),[[W,C.value]])]),_:1}),e(j,{modelValue:A.value,"onUpdate:modelValue":t[1]||(t[1]=l=>A.value=l),title:(Y=k.value)==null?void 0:Y.name,width:"800px",class:"camera-dialog"},{default:a(()=>{var l,b,Z;return[o("div",Oe,[o("div",Xe,[e(x,{size:64},{default:a(()=>[e(v(xe))]),_:1}),t[22]||(t[22]=o("span",null,"监控预览",-1)),o("div",je,[o("p",null,[t[19]||(t[19]=o("strong",null,"位置：",-1)),r(p((l=k.value)==null?void 0:l.location),1)]),o("p",null,[t[20]||(t[20]=o("strong",null,"类型：",-1)),r(p((b=k.value)==null?void 0:b.type),1)]),o("p",null,[t[21]||(t[21]=o("strong",null,"状态：",-1)),e(y,{type:L((Z=k.value)==null?void 0:Z.status)},{default:a(()=>{var G;return[r(p((G=k.value)==null?void 0:G.status),1)]}),_:1},8,["type"])])])])]),o("div",Je,[o("div",We,[t[23]||(t[23]=o("span",{class:"control-label"},"方向控制",-1)),e(X,null,{default:a(()=>[e(u,{type:"primary",icon:v(Me)},null,8,["icon"]),e(u,{type:"primary",icon:v(De)},null,8,["icon"]),e(u,{type:"primary",icon:v($e)},null,8,["icon"]),e(u,{type:"primary",icon:v(Te)},null,8,["icon"])]),_:1})]),o("div",Ye,[t[24]||(t[24]=o("span",{class:"control-label"},"变焦控制",-1)),e(X,null,{default:a(()=>[e(u,{type:"primary",icon:v(Be)},null,8,["icon"]),e(u,{type:"primary",icon:v(Ae)},null,8,["icon"])]),_:1})])])]}),_:1},8,["modelValue","title"]),e(j,{modelValue:V.value,"onUpdate:modelValue":t[6]||(t[6]=l=>V.value=l),title:"添加监控点",width:"500px","destroy-on-close":""},{footer:a(()=>[o("div",Ze,[e(u,{onClick:t[5]||(t[5]=l=>V.value=!1)},{default:a(()=>t[25]||(t[25]=[r("取消")])),_:1}),e(u,{type:"primary",onClick:ve},{default:a(()=>t[26]||(t[26]=[r("确定")])),_:1})])]),default:a(()=>[e(ye,{ref_key:"addFormRef",ref:S,model:g.value,rules:le,"label-width":"100px",class:"dialog-form"},{default:a(()=>[e(U,{label:"设备名称",prop:"name"},{default:a(()=>[e(J,{modelValue:g.value.name,"onUpdate:modelValue":t[2]||(t[2]=l=>g.value.name=l),placeholder:"请输入设备名称，格式：IPC-X0-00"},null,8,["modelValue"])]),_:1}),e(U,{label:"安装位置",prop:"location"},{default:a(()=>[e(J,{modelValue:g.value.location,"onUpdate:modelValue":t[3]||(t[3]=l=>g.value.location=l),placeholder:"请输入安装位置"},null,8,["modelValue"])]),_:1}),e(U,{label:"设备类型",prop:"type"},{default:a(()=>[e(H,{modelValue:g.value.type,"onUpdate:modelValue":t[4]||(t[4]=l=>g.value.type=l),placeholder:"请选择设备类型",class:"form-select"},{default:a(()=>[(_(),B(R,null,z(te,l=>e(q,{key:l,label:l,value:l},null,8,["label","value"])),64))]),_:1},8,["modelValue"])]),_:1})]),_:1},8,["model"])]),_:1},8,["modelValue"])])}}}),at=Se(Ke,[["__scopeId","data-v-4d52e6df"]]);export{at as default};
