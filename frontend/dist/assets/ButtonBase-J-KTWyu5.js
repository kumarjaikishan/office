var Bt=Object.defineProperty;var St=(t,e,n)=>e in t?Bt(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var _=(t,e,n)=>St(t,typeof e!="symbol"?e+"":e,n);import{r as u,a9 as Dt,ap as W,a8 as jt,o as x,j as k,i as ct,k as pt,n as tt,aW as et,h as Lt,m as it,p as Nt}from"./index-DR2mEqic.js";function G(t){const e=u.useRef(t);return Dt(()=>{e.current=t}),u.useRef((...n)=>(0,e.current)(...n)).current}function kt(t,e){if(t==null)return{};var n={};for(var s in t)if({}.hasOwnProperty.call(t,s)){if(e.indexOf(s)!==-1)continue;n[s]=t[s]}return n}function J(t,e){return J=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(n,s){return n.__proto__=s,n},J(t,e)}function vt(t,e){t.prototype=Object.create(e.prototype),t.prototype.constructor=t,J(t,e)}const at=W.createContext(null);function Ot(t){if(t===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function nt(t,e){var n=function(r){return e&&u.isValidElement(r)?e(r):r},s=Object.create(null);return t&&u.Children.map(t,function(o){return o}).forEach(function(o){s[o.key]=n(o)}),s}function $t(t,e){t=t||{},e=e||{};function n(d){return d in e?e[d]:t[d]}var s=Object.create(null),o=[];for(var r in t)r in e?o.length&&(s[r]=o,o=[]):o.push(r);var i,p={};for(var l in e){if(s[l])for(i=0;i<s[l].length;i++){var f=s[l][i];p[s[l][i]]=n(f)}p[l]=n(l)}for(i=0;i<o.length;i++)p[o[i]]=n(o[i]);return p}function N(t,e,n){return n[e]!=null?n[e]:t.props[e]}function Ft(t,e){return nt(t.children,function(n){return u.cloneElement(n,{onExited:e.bind(null,n),in:!0,appear:N(n,"appear",t),enter:N(n,"enter",t),exit:N(n,"exit",t)})})}function Ut(t,e,n){var s=nt(t.children),o=$t(e,s);return Object.keys(o).forEach(function(r){var i=o[r];if(u.isValidElement(i)){var p=r in e,l=r in s,f=e[r],d=u.isValidElement(f)&&!f.props.in;l&&(!p||d)?o[r]=u.cloneElement(i,{onExited:n.bind(null,i),in:!0,exit:N(i,"exit",t),enter:N(i,"enter",t)}):!l&&p&&!d?o[r]=u.cloneElement(i,{in:!1}):l&&p&&u.isValidElement(f)&&(o[r]=u.cloneElement(i,{onExited:n.bind(null,i),in:f.props.in,exit:N(i,"exit",t),enter:N(i,"enter",t)}))}}),o}var zt=Object.values||function(t){return Object.keys(t).map(function(e){return t[e]})},At={component:"div",childFactory:function(e){return e}},ot=function(t){vt(e,t);function e(s,o){var r;r=t.call(this,s,o)||this;var i=r.handleExited.bind(Ot(r));return r.state={contextValue:{isMounting:!0},handleExited:i,firstRender:!0},r}var n=e.prototype;return n.componentDidMount=function(){this.mounted=!0,this.setState({contextValue:{isMounting:!1}})},n.componentWillUnmount=function(){this.mounted=!1},e.getDerivedStateFromProps=function(o,r){var i=r.children,p=r.handleExited,l=r.firstRender;return{children:l?Ft(o,p):Ut(o,i,p),firstRender:!1}},n.handleExited=function(o,r){var i=nt(this.props.children);o.key in i||(o.props.onExited&&o.props.onExited(r),this.mounted&&this.setState(function(p){var l=jt({},p.children);return delete l[o.key],{children:l}}))},n.render=function(){var o=this.props,r=o.component,i=o.childFactory,p=kt(o,["component","childFactory"]),l=this.state.contextValue,f=zt(this.state.children).map(i);return delete p.appear,delete p.enter,delete p.exit,r===null?W.createElement(at.Provider,{value:l},f):W.createElement(at.Provider,{value:l},W.createElement(r,p,f))},e}(W.Component);ot.propTypes={};ot.defaultProps=At;const ut={};function ft(t,e){const n=u.useRef(ut);return n.current===ut&&(n.current=t(e)),n}const Yt=[];function _t(t){u.useEffect(t,Yt)}class rt{constructor(){_(this,"currentId",null);_(this,"clear",()=>{this.currentId!==null&&(clearTimeout(this.currentId),this.currentId=null)});_(this,"disposeEffect",()=>this.clear)}static create(){return new rt}start(e,n){this.clear(),this.currentId=setTimeout(()=>{this.currentId=null,n()},e)}}function Wt(){const t=ft(rt.create).current;return _t(t.disposeEffect),t}function lt(t){try{return t.matches(":focus-visible")}catch{}return!1}class q{constructor(){_(this,"mountEffect",()=>{this.shouldMount&&!this.didMount&&this.ref.current!==null&&(this.didMount=!0,this.mounted.resolve())});this.ref={current:null},this.mounted=null,this.didMount=!1,this.shouldMount=!1,this.setShouldMount=null}static create(){return new q}static use(){const e=ft(q.create).current,[n,s]=u.useState(!1);return e.shouldMount=n,e.setShouldMount=s,u.useEffect(e.mountEffect,[n]),e}mount(){return this.mounted||(this.mounted=Kt(),this.shouldMount=!0,this.setShouldMount(this.shouldMount)),this.mounted}start(...e){this.mount().then(()=>{var n;return(n=this.ref.current)==null?void 0:n.start(...e)})}stop(...e){this.mount().then(()=>{var n;return(n=this.ref.current)==null?void 0:n.stop(...e)})}pulsate(...e){this.mount().then(()=>{var n;return(n=this.ref.current)==null?void 0:n.pulsate(...e)})}}function Xt(){return q.use()}function Kt(){let t,e;const n=new Promise((s,o)=>{t=s,e=o});return n.resolve=t,n.reject=e,n}function Ht(t){const{className:e,classes:n,pulsate:s=!1,rippleX:o,rippleY:r,rippleSize:i,in:p,onExited:l,timeout:f}=t,[d,h]=u.useState(!1),M=x(e,n.ripple,n.rippleVisible,s&&n.ripplePulsate),V={width:i,height:i,top:-(i/2)+r,left:-(i/2)+o},b=x(n.child,d&&n.childLeaving,s&&n.childPulsate);return!p&&!d&&h(!0),u.useEffect(()=>{if(!p&&l!=null){const S=setTimeout(l,f);return()=>{clearTimeout(S)}}},[l,p,f]),k.jsx("span",{className:M,style:V,children:k.jsx("span",{className:b})})}const g=ct("MuiTouchRipple",["root","ripple","rippleVisible","ripplePulsate","child","childLeaving","childPulsate"]),Q=550,Gt=80,qt=et`
  0% {
    transform: scale(0);
    opacity: 0.1;
  }

  100% {
    transform: scale(1);
    opacity: 0.3;
  }
`,Zt=et`
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`,Jt=et`
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.92);
  }

  100% {
    transform: scale(1);
  }
`,Qt=tt("span",{name:"MuiTouchRipple",slot:"Root"})({overflow:"hidden",pointerEvents:"none",position:"absolute",zIndex:0,top:0,right:0,bottom:0,left:0,borderRadius:"inherit"}),te=tt(Ht,{name:"MuiTouchRipple",slot:"Ripple"})`
  opacity: 0;
  position: absolute;

  &.${g.rippleVisible} {
    opacity: 0.3;
    transform: scale(1);
    animation-name: ${qt};
    animation-duration: ${Q}ms;
    animation-timing-function: ${({theme:t})=>t.transitions.easing.easeInOut};
  }

  &.${g.ripplePulsate} {
    animation-duration: ${({theme:t})=>t.transitions.duration.shorter}ms;
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
    animation-name: ${Zt};
    animation-duration: ${Q}ms;
    animation-timing-function: ${({theme:t})=>t.transitions.easing.easeInOut};
  }

  & .${g.childPulsate} {
    position: absolute;
    /* @noflip */
    left: 0px;
    top: 0;
    animation-name: ${Jt};
    animation-duration: 2500ms;
    animation-timing-function: ${({theme:t})=>t.transitions.easing.easeInOut};
    animation-iteration-count: infinite;
    animation-delay: 200ms;
  }
`,ee=u.forwardRef(function(e,n){const s=pt({props:e,name:"MuiTouchRipple"}),{center:o=!1,classes:r={},className:i,...p}=s,[l,f]=u.useState([]),d=u.useRef(0),h=u.useRef(null);u.useEffect(()=>{h.current&&(h.current(),h.current=null)},[l]);const M=u.useRef(!1),V=Wt(),b=u.useRef(null),S=u.useRef(null),C=u.useCallback(c=>{const{pulsate:y,rippleX:R,rippleY:$,rippleSize:D,cb:F}=c;f(E=>[...E,k.jsx(te,{classes:{ripple:x(r.ripple,g.ripple),rippleVisible:x(r.rippleVisible,g.rippleVisible),ripplePulsate:x(r.ripplePulsate,g.ripplePulsate),child:x(r.child,g.child),childLeaving:x(r.childLeaving,g.childLeaving),childPulsate:x(r.childPulsate,g.childPulsate)},timeout:Q,pulsate:y,rippleX:R,rippleY:$,rippleSize:D},d.current)]),d.current+=1,h.current=F},[r]),v=u.useCallback((c={},y={},R=()=>{})=>{const{pulsate:$=!1,center:D=o||y.pulsate,fakeElement:F=!1}=y;if((c==null?void 0:c.type)==="mousedown"&&M.current){M.current=!1;return}(c==null?void 0:c.type)==="touchstart"&&(M.current=!0);const E=F?null:S.current,I=E?E.getBoundingClientRect():{width:0,height:0,left:0,top:0};let w,T,B;if(D||c===void 0||c.clientX===0&&c.clientY===0||!c.clientX&&!c.touches)w=Math.round(I.width/2),T=Math.round(I.height/2);else{const{clientX:U,clientY:j}=c.touches&&c.touches.length>0?c.touches[0]:c;w=Math.round(U-I.left),T=Math.round(j-I.top)}if(D)B=Math.sqrt((2*I.width**2+I.height**2)/3),B%2===0&&(B+=1);else{const U=Math.max(Math.abs((E?E.clientWidth:0)-w),w)*2+2,j=Math.max(Math.abs((E?E.clientHeight:0)-T),T)*2+2;B=Math.sqrt(U**2+j**2)}c!=null&&c.touches?b.current===null&&(b.current=()=>{C({pulsate:$,rippleX:w,rippleY:T,rippleSize:B,cb:R})},V.start(Gt,()=>{b.current&&(b.current(),b.current=null)})):C({pulsate:$,rippleX:w,rippleY:T,rippleSize:B,cb:R})},[o,C,V]),X=u.useCallback(()=>{v({},{pulsate:!0})},[v]),O=u.useCallback((c,y)=>{if(V.clear(),(c==null?void 0:c.type)==="touchend"&&b.current){b.current(),b.current=null,V.start(0,()=>{O(c,y)});return}b.current=null,f(R=>R.length>0?R.slice(1):R),h.current=y},[V]);return u.useImperativeHandle(n,()=>({pulsate:X,start:v,stop:O}),[X,v,O]),k.jsx(Qt,{className:x(g.root,r.root,i),ref:S,...p,children:k.jsx(ot,{component:null,exit:!0,children:l})})});function ne(t){return Lt("MuiButtonBase",t)}const oe=ct("MuiButtonBase",["root","disabled","focusVisible"]),re=t=>{const{disabled:e,focusVisible:n,focusVisibleClassName:s,classes:o}=t,i=Nt({root:["root",e&&"disabled",n&&"focusVisible"]},ne,o);return n&&s&&(i.root+=` ${s}`),i},se=tt("button",{name:"MuiButtonBase",slot:"Root"})({display:"inline-flex",alignItems:"center",justifyContent:"center",position:"relative",boxSizing:"border-box",WebkitTapHighlightColor:"transparent",backgroundColor:"transparent",outline:0,border:0,margin:0,borderRadius:0,padding:0,cursor:"pointer",userSelect:"none",verticalAlign:"middle",MozAppearance:"none",WebkitAppearance:"none",textDecoration:"none",color:"inherit","&::-moz-focus-inner":{borderStyle:"none"},[`&.${oe.disabled}`]:{pointerEvents:"none",cursor:"default"},"@media print":{colorAdjust:"exact"}}),ue=u.forwardRef(function(e,n){const s=pt({props:e,name:"MuiButtonBase"}),{action:o,centerRipple:r=!1,children:i,className:p,component:l="button",disabled:f=!1,disableRipple:d=!1,disableTouchRipple:h=!1,focusRipple:M=!1,focusVisibleClassName:V,LinkComponent:b="a",onBlur:S,onClick:C,onContextMenu:v,onDragLeave:X,onFocus:O,onFocusVisible:c,onKeyDown:y,onKeyUp:R,onMouseDown:$,onMouseLeave:D,onMouseUp:F,onTouchEnd:E,onTouchMove:I,onTouchStart:w,tabIndex:T=0,TouchRippleProps:B,touchRippleRef:U,type:j,...z}=s,A=u.useRef(null),m=Xt(),dt=it(m.ref,U),[L,K]=u.useState(!1);f&&L&&K(!1),u.useImperativeHandle(o,()=>({focusVisible:()=>{K(!0),A.current.focus()}}),[]);const ht=m.shouldMount&&!d&&!f;u.useEffect(()=>{L&&M&&!d&&m.pulsate()},[d,M,L,m]);const mt=P(m,"start",$,h),bt=P(m,"stop",v,h),gt=P(m,"stop",X,h),Mt=P(m,"stop",F,h),Rt=P(m,"stop",a=>{L&&a.preventDefault(),D&&D(a)},h),yt=P(m,"start",w,h),Et=P(m,"stop",E,h),xt=P(m,"stop",I,h),Ct=P(m,"stop",a=>{lt(a.target)||K(!1),S&&S(a)},!1),Tt=G(a=>{A.current||(A.current=a.currentTarget),lt(a.target)&&(K(!0),c&&c(a)),O&&O(a)}),Z=()=>{const a=A.current;return l&&l!=="button"&&!(a.tagName==="A"&&a.href)},Pt=G(a=>{M&&!a.repeat&&L&&a.key===" "&&m.stop(a,()=>{m.start(a)}),a.target===a.currentTarget&&Z()&&a.key===" "&&a.preventDefault(),y&&y(a),a.target===a.currentTarget&&Z()&&a.key==="Enter"&&!f&&(a.preventDefault(),C&&C(a))}),Vt=G(a=>{M&&a.key===" "&&L&&!a.defaultPrevented&&m.stop(a,()=>{m.pulsate(a)}),R&&R(a),C&&a.target===a.currentTarget&&Z()&&a.key===" "&&!a.defaultPrevented&&C(a)});let H=l;H==="button"&&(z.href||z.to)&&(H=b);const Y={};H==="button"?(Y.type=j===void 0?"button":j,Y.disabled=f):(!z.href&&!z.to&&(Y.role="button"),f&&(Y["aria-disabled"]=f));const It=it(n,A),st={...s,centerRipple:r,component:l,disabled:f,disableRipple:d,disableTouchRipple:h,focusRipple:M,tabIndex:T,focusVisible:L},wt=re(st);return k.jsxs(se,{as:H,className:x(wt.root,p),ownerState:st,onBlur:Ct,onClick:C,onContextMenu:bt,onFocus:Tt,onKeyDown:Pt,onKeyUp:Vt,onMouseDown:mt,onMouseLeave:Rt,onMouseUp:Mt,onDragLeave:gt,onTouchEnd:Et,onTouchMove:xt,onTouchStart:yt,ref:It,tabIndex:f?-1:T,type:j,...Y,...z,children:[i,ht?k.jsx(ee,{ref:dt,center:r,...B}):null]})});function P(t,e,n,s=!1){return G(o=>(n&&n(o),s||t[e](o),!0))}export{ue as B,rt as T,kt as _,G as a,ft as b,vt as c,ot as d,at as e,lt as i,Wt as u};
