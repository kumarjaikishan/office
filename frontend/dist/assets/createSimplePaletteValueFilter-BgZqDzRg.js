var Pe=Object.defineProperty;var Ve=(e,t,n)=>t in e?Pe(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var ie=(e,t,n)=>Ve(e,typeof t!="symbol"?t+"":t,n);import{r as l,bd as Se,af as Be,ag as De,ao as H,bD as oe,b6 as we,z as E,j as N,q as ae,v as le,b1 as Le,x as Q,bq as Z,t as ke,aj as se,ak as q,D as je}from"./index-B_hvNrZx.js";function ve(e){if(e===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function ee(e,t){var n=function(o){return t&&l.isValidElement(o)?t(o):o},a=Object.create(null);return e&&l.Children.map(e,function(i){return i}).forEach(function(i){a[i.key]=n(i)}),a}function Ne(e,t){e=e||{},t=t||{};function n(d){return d in t?t[d]:e[d]}var a=Object.create(null),i=[];for(var o in e)o in t?i.length&&(a[o]=i,i=[]):i.push(o);var s,p={};for(var u in t){if(a[u])for(s=0;s<a[u].length;s++){var f=a[u][s];p[a[u][s]]=n(f)}p[u]=n(u)}for(s=0;s<i.length;s++)p[i[s]]=n(i[s]);return p}function v(e,t,n){return n[t]!=null?n[t]:e.props[t]}function $e(e,t){return ee(e.children,function(n){return l.cloneElement(n,{onExited:t.bind(null,n),in:!0,appear:v(n,"appear",e),enter:v(n,"enter",e),exit:v(n,"exit",e)})})}function Fe(e,t,n){var a=ee(e.children),i=Ne(t,a);return Object.keys(i).forEach(function(o){var s=i[o];if(l.isValidElement(s)){var p=o in t,u=o in a,f=t[o],d=l.isValidElement(f)&&!f.props.in;u&&(!p||d)?i[o]=l.cloneElement(s,{onExited:n.bind(null,s),in:!0,exit:v(s,"exit",e),enter:v(s,"enter",e)}):!u&&p&&!d?i[o]=l.cloneElement(s,{in:!1}):u&&p&&l.isValidElement(f)&&(i[o]=l.cloneElement(s,{onExited:n.bind(null,s),in:f.props.in,exit:v(s,"exit",e),enter:v(s,"enter",e)}))}}),i}var Ie=Object.values||function(e){return Object.keys(e).map(function(t){return e[t]})},Ue={component:"div",childFactory:function(t){return t}},te=(function(e){Se(t,e);function t(a,i){var o;o=e.call(this,a,i)||this;var s=o.handleExited.bind(ve(o));return o.state={contextValue:{isMounting:!0},handleExited:s,firstRender:!0},o}var n=t.prototype;return n.componentDidMount=function(){this.mounted=!0,this.setState({contextValue:{isMounting:!1}})},n.componentWillUnmount=function(){this.mounted=!1},t.getDerivedStateFromProps=function(i,o){var s=o.children,p=o.handleExited,u=o.firstRender;return{children:u?$e(i,p):Fe(i,s,p),firstRender:!1}},n.handleExited=function(i,o){var s=ee(this.props.children);i.key in s||(i.props.onExited&&i.props.onExited(o),this.mounted&&this.setState(function(p){var u=Be({},p.children);return delete u[i.key],{children:u}}))},n.render=function(){var i=this.props,o=i.component,s=i.childFactory,p=De(i,["component","childFactory"]),u=this.state.contextValue,f=Ie(this.state.children).map(s);return delete p.appear,delete p.enter,delete p.exit,o===null?H.createElement(oe.Provider,{value:u},f):H.createElement(oe.Provider,{value:u},H.createElement(o,p,f))},t})(H.Component);te.propTypes={};te.defaultProps=Ue;function re(e){try{return e.matches(":focus-visible")}catch{}return!1}class G{constructor(){ie(this,"mountEffect",()=>{this.shouldMount&&!this.didMount&&this.ref.current!==null&&(this.didMount=!0,this.mounted.resolve())});this.ref={current:null},this.mounted=null,this.didMount=!1,this.shouldMount=!1,this.setShouldMount=null}static create(){return new G}static use(){const t=we(G.create).current,[n,a]=l.useState(!1);return t.shouldMount=n,t.setShouldMount=a,l.useEffect(t.mountEffect,[n]),t}mount(){return this.mounted||(this.mounted=Oe(),this.shouldMount=!0,this.setShouldMount(this.shouldMount)),this.mounted}start(...t){this.mount().then(()=>{var n;return(n=this.ref.current)==null?void 0:n.start(...t)})}stop(...t){this.mount().then(()=>{var n;return(n=this.ref.current)==null?void 0:n.stop(...t)})}pulsate(...t){this.mount().then(()=>{var n;return(n=this.ref.current)==null?void 0:n.pulsate(...t)})}}function ze(){return G.use()}function Oe(){let e,t;const n=new Promise((a,i)=>{e=a,t=i});return n.resolve=e,n.reject=t,n}function Ae(e){const{className:t,classes:n,pulsate:a=!1,rippleX:i,rippleY:o,rippleSize:s,in:p,onExited:u,timeout:f}=e,[d,h]=l.useState(!1),M=E(t,n.ripple,n.rippleVisible,a&&n.ripplePulsate),V={width:s,height:s,top:-(s/2)+o,left:-(s/2)+i},b=E(n.child,d&&n.childLeaving,a&&n.childPulsate);return!p&&!d&&h(!0),l.useEffect(()=>{if(!p&&u!=null){const w=setTimeout(u,f);return()=>{clearTimeout(w)}}},[u,p,f]),N.jsx("span",{className:M,style:V,children:N.jsx("span",{className:b})})}const g=ae("MuiTouchRipple",["root","ripple","rippleVisible","ripplePulsate","child","childLeaving","childPulsate"]),J=550,Xe=80,Ye=Z`
  0% {
    transform: scale(0);
    opacity: 0.1;
  }

  100% {
    transform: scale(1);
    opacity: 0.3;
  }
`,Ke=Z`
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`,We=Z`
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.92);
  }

  100% {
    transform: scale(1);
  }
`,He=Q("span",{name:"MuiTouchRipple",slot:"Root"})({overflow:"hidden",pointerEvents:"none",position:"absolute",zIndex:0,top:0,right:0,bottom:0,left:0,borderRadius:"inherit"}),qe=Q(Ae,{name:"MuiTouchRipple",slot:"Ripple"})`
  opacity: 0;
  position: absolute;

  &.${g.rippleVisible} {
    opacity: 0.3;
    transform: scale(1);
    animation-name: ${Ye};
    animation-duration: ${J}ms;
    animation-timing-function: ${({theme:e})=>e.transitions.easing.easeInOut};
  }

  &.${g.ripplePulsate} {
    animation-duration: ${({theme:e})=>e.transitions.duration.shorter}ms;
  }

  & .${g.child} {
    opacity: 1;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: currentColor;
  }

  & .${g.childLeaving} {
    opacity: 0;
    animation-name: ${Ke};
    animation-duration: ${J}ms;
    animation-timing-function: ${({theme:e})=>e.transitions.easing.easeInOut};
  }

  & .${g.childPulsate} {
    position: absolute;
    /* @noflip */
    left: 0px;
    top: 0;
    animation-name: ${We};
    animation-duration: 2500ms;
    animation-timing-function: ${({theme:e})=>e.transitions.easing.easeInOut};
    animation-iteration-count: infinite;
    animation-delay: 200ms;
  }
`,Ge=l.forwardRef(function(t,n){const a=le({props:t,name:"MuiTouchRipple"}),{center:i=!1,classes:o={},className:s,...p}=a,[u,f]=l.useState([]),d=l.useRef(0),h=l.useRef(null);l.useEffect(()=>{h.current&&(h.current(),h.current=null)},[u]);const M=l.useRef(!1),V=Le(),b=l.useRef(null),w=l.useRef(null),C=l.useCallback(c=>{const{pulsate:y,rippleX:R,rippleY:I,rippleSize:L,cb:U}=c;f(x=>[...x,N.jsx(qe,{classes:{ripple:E(o.ripple,g.ripple),rippleVisible:E(o.rippleVisible,g.rippleVisible),ripplePulsate:E(o.ripplePulsate,g.ripplePulsate),child:E(o.child,g.child),childLeaving:E(o.childLeaving,g.childLeaving),childPulsate:E(o.childPulsate,g.childPulsate)},timeout:J,pulsate:y,rippleX:R,rippleY:I,rippleSize:L},d.current)]),d.current+=1,h.current=U},[o]),$=l.useCallback((c={},y={},R=()=>{})=>{const{pulsate:I=!1,center:L=i||y.pulsate,fakeElement:U=!1}=y;if((c==null?void 0:c.type)==="mousedown"&&M.current){M.current=!1;return}(c==null?void 0:c.type)==="touchstart"&&(M.current=!0);const x=U?null:w.current,S=x?x.getBoundingClientRect():{width:0,height:0,left:0,top:0};let B,T,D;if(L||c===void 0||c.clientX===0&&c.clientY===0||!c.clientX&&!c.touches)B=Math.round(S.width/2),T=Math.round(S.height/2);else{const{clientX:z,clientY:k}=c.touches&&c.touches.length>0?c.touches[0]:c;B=Math.round(z-S.left),T=Math.round(k-S.top)}if(L)D=Math.sqrt((2*S.width**2+S.height**2)/3),D%2===0&&(D+=1);else{const z=Math.max(Math.abs((x?x.clientWidth:0)-B),B)*2+2,k=Math.max(Math.abs((x?x.clientHeight:0)-T),T)*2+2;D=Math.sqrt(z**2+k**2)}c!=null&&c.touches?b.current===null&&(b.current=()=>{C({pulsate:I,rippleX:B,rippleY:T,rippleSize:D,cb:R})},V.start(Xe,()=>{b.current&&(b.current(),b.current=null)})):C({pulsate:I,rippleX:B,rippleY:T,rippleSize:D,cb:R})},[i,C,V]),Y=l.useCallback(()=>{$({},{pulsate:!0})},[$]),F=l.useCallback((c,y)=>{if(V.clear(),(c==null?void 0:c.type)==="touchend"&&b.current){b.current(),b.current=null,V.start(0,()=>{F(c,y)});return}b.current=null,f(R=>R.length>0?R.slice(1):R),h.current=y},[V]);return l.useImperativeHandle(n,()=>({pulsate:Y,start:$,stop:F}),[Y,$,F]),N.jsx(He,{className:E(g.root,o.root,s),ref:w,...p,children:N.jsx(te,{component:null,exit:!0,children:u})})});function _e(e){return ke("MuiButtonBase",e)}const Je=ae("MuiButtonBase",["root","disabled","focusVisible"]),Qe=e=>{const{disabled:t,focusVisible:n,focusVisibleClassName:a,classes:i}=e,s=je({root:["root",t&&"disabled",n&&"focusVisible"]},_e,i);return n&&a&&(s.root+=` ${a}`),s},Ze=Q("button",{name:"MuiButtonBase",slot:"Root"})({display:"inline-flex",alignItems:"center",justifyContent:"center",position:"relative",boxSizing:"border-box",WebkitTapHighlightColor:"transparent",backgroundColor:"transparent",outline:0,border:0,margin:0,borderRadius:0,padding:0,cursor:"pointer",userSelect:"none",verticalAlign:"middle",MozAppearance:"none",WebkitAppearance:"none",textDecoration:"none",color:"inherit","&::-moz-focus-inner":{borderStyle:"none"},[`&.${Je.disabled}`]:{pointerEvents:"none",cursor:"default"},"@media print":{colorAdjust:"exact"}}),ot=l.forwardRef(function(t,n){const a=le({props:t,name:"MuiButtonBase"}),{action:i,centerRipple:o=!1,children:s,className:p,component:u="button",disabled:f=!1,disableRipple:d=!1,disableTouchRipple:h=!1,focusRipple:M=!1,focusVisibleClassName:V,LinkComponent:b="a",onBlur:w,onClick:C,onContextMenu:$,onDragLeave:Y,onFocus:F,onFocusVisible:c,onKeyDown:y,onKeyUp:R,onMouseDown:I,onMouseLeave:L,onMouseUp:U,onTouchEnd:x,onTouchMove:S,onTouchStart:B,tabIndex:T=0,TouchRippleProps:D,touchRippleRef:z,type:k,...O}=a,A=l.useRef(null),m=ze(),ue=se(m.ref,z),[j,K]=l.useState(!1);f&&j&&K(!1),l.useImperativeHandle(i,()=>({focusVisible:()=>{K(!0),A.current.focus()}}),[]);const ce=m.shouldMount&&!d&&!f;l.useEffect(()=>{j&&M&&!d&&m.pulsate()},[d,M,j,m]);const pe=P(m,"start",I,h),fe=P(m,"stop",$,h),de=P(m,"stop",Y,h),he=P(m,"stop",U,h),me=P(m,"stop",r=>{j&&r.preventDefault(),L&&L(r)},h),be=P(m,"start",B,h),ge=P(m,"stop",x,h),Me=P(m,"stop",S,h),Re=P(m,"stop",r=>{re(r.target)||K(!1),w&&w(r)},!1),ye=q(r=>{A.current||(A.current=r.currentTarget),re(r.target)&&(K(!0),c&&c(r)),F&&F(r)}),_=()=>{const r=A.current;return u&&u!=="button"&&!(r.tagName==="A"&&r.href)},xe=q(r=>{M&&!r.repeat&&j&&r.key===" "&&m.stop(r,()=>{m.start(r)}),r.target===r.currentTarget&&_()&&r.key===" "&&r.preventDefault(),y&&y(r),r.target===r.currentTarget&&_()&&r.key==="Enter"&&!f&&(r.preventDefault(),C&&C(r))}),Ee=q(r=>{M&&r.key===" "&&j&&!r.defaultPrevented&&m.stop(r,()=>{m.pulsate(r)}),R&&R(r),C&&r.target===r.currentTarget&&_()&&r.key===" "&&!r.defaultPrevented&&C(r)});let W=u;W==="button"&&(O.href||O.to)&&(W=b);const X={};W==="button"?(X.type=k===void 0?"button":k,X.disabled=f):(!O.href&&!O.to&&(X.role="button"),f&&(X["aria-disabled"]=f));const Ce=se(n,A),ne={...a,centerRipple:o,component:u,disabled:f,disableRipple:d,disableTouchRipple:h,focusRipple:M,tabIndex:T,focusVisible:j},Te=Qe(ne);return N.jsxs(Ze,{as:W,className:E(Te.root,p),ownerState:ne,onBlur:Re,onClick:C,onContextMenu:fe,onFocus:ye,onKeyDown:xe,onKeyUp:Ee,onMouseDown:pe,onMouseLeave:me,onMouseUp:he,onDragLeave:de,onTouchEnd:ge,onTouchMove:Me,onTouchStart:be,ref:Ce,tabIndex:f?-1:T,type:k,...X,...O,children:[s,ce?N.jsx(Ge,{ref:ue,center:o,...D}):null]})});function P(e,t,n,a=!1){return q(i=>(n&&n(i),a||e[t](i),!0))}function et(e){return typeof e.main=="string"}function tt(e,t=[]){if(!et(e))return!1;for(const n of t)if(!e.hasOwnProperty(n)||typeof e[n]!="string")return!1;return!0}function st(e=[]){return([,t])=>t&&tt(t,e)}export{ot as B,te as T,st as c,re as i};
