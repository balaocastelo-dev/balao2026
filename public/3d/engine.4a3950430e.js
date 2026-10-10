"use strict";(()=>{var pf=Object.defineProperty;var mf=(i,t)=>{for(var e in t)pf(i,e,{get:t[e],enumerable:!0})};var Xi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},qi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},gf=0,Zh=1,xf=2;var dd=1,qc=2,Kn=3,Mi=0,Ge=1,Oe=2,vi=0,_s=1,Co=2,$h=3,Jh=4,_f=5,zi=100,vf=101,yf=102,Mf=103,bf=104,Sf=200,wf=201,Ef=202,Tf=203,El=204,Tl=205,Af=206,Rf=207,Cf=208,Pf=209,If=210,Df=211,Lf=212,Uf=213,Nf=214,Al=0,Rl=1,Cl=2,bs=3,Pl=4,Il=5,Dl=6,Ll=7,fd=0,Ff=1,Of=2,yi=0,kf=1,zf=2,Bf=3,Yc=4,Hf=5,Vf=6,Gf=7,Kh="attached",Wf="detached",pd=300,Ss=301,ws=302,Ul=303,Nl=304,aa=306,On=1e3,Nn=1001,Fl=1002,Ke=1003,Xf=1004;var Jr=1005;var Fn=1006,Wa=1007;var jn=1008;var ei=1009,md=1010,gd=1011,mr=1012,Zc=1013,ni=1014,Cn=1015,oi=1016,$c=1017,Jc=1018,Es=1020,xd=35902,_d=1021,vd=1022,gn=1023,yd=1024,Md=1025,vs=1026,Ts=1027,Kc=1028,jc=1029,bd=1030,Qc=1031;var th=1033,wo=33776,Eo=33777,To=33778,Ao=33779,Ol=35840,kl=35841,zl=35842,Bl=35843,Hl=36196,Vl=37492,Gl=37496,Wl=37808,Xl=37809,ql=37810,Yl=37811,Zl=37812,$l=37813,Jl=37814,Kl=37815,jl=37816,Ql=37817,tc=37818,ec=37819,nc=37820,ic=37821,Ro=36492,sc=36494,rc=36495,Sd=36283,oc=36284,ac=36285,lc=36286,la=2200,eh=2201,qf=2202,Po=2300,cc=2301,Xa=2302,ps=2400,ms=2401,Io=2402,nh=2500,Yf=2501;var Zf=3200,$f=3201;var wd=0,Jf=1,_i="",Pe="srgb",zs="srgb-linear",ca="linear",_e="srgb";var ji=7680;var jh=519,Kf=512,jf=513,Qf=514,Ed=515,tp=516,ep=517,np=518,ip=519,Qh=35044;var tu="300 es",Qn=2e3,Do=2001,kn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;let n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;let s=this._listeners[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;let n=this._listeners[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}},He=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],eu=1234567,cr=Math.PI/180,As=180/Math.PI;function ai(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(He[i&255]+He[i>>8&255]+He[i>>16&255]+He[i>>24&255]+"-"+He[t&255]+He[t>>8&255]+"-"+He[t>>16&15|64]+He[t>>24&255]+"-"+He[e&63|128]+He[e>>8&255]+"-"+He[e>>16&255]+He[e>>24&255]+He[n&255]+He[n>>8&255]+He[n>>16&255]+He[n>>24&255]).toLowerCase()}function De(i,t,e){return Math.max(t,Math.min(e,i))}function ih(i,t){return(i%t+t)%t}function sp(i,t,e,n,s){return n+(i-t)*(s-n)/(e-t)}function rp(i,t,e){return i!==t?(e-i)/(t-i):0}function hr(i,t,e){return(1-e)*i+e*t}function op(i,t,e,n){return hr(i,t,1-Math.exp(-e*n))}function ap(i,t=1){return t-Math.abs(ih(i,t*2)-t)}function lp(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*(3-2*i))}function cp(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*i*(i*(i*6-15)+10))}function hp(i,t){return i+Math.floor(Math.random()*(t-i+1))}function up(i,t){return i+Math.random()*(t-i)}function dp(i){return i*(.5-Math.random())}function fp(i){i!==void 0&&(eu=i);let t=eu+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function pp(i){return i*cr}function mp(i){return i*As}function gp(i){return(i&i-1)===0&&i!==0}function xp(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function _p(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function vp(i,t,e,n,s){let r=Math.cos,o=Math.sin,a=r(e/2),c=o(e/2),h=r((t+n)/2),l=o((t+n)/2),u=r((t-n)/2),d=o((t-n)/2),f=r((n-t)/2),p=o((n-t)/2);switch(s){case"XYX":i.set(a*l,c*u,c*d,a*h);break;case"YZY":i.set(c*d,a*l,c*u,a*h);break;case"ZXZ":i.set(c*u,c*d,a*l,a*h);break;case"XZX":i.set(a*l,c*p,c*f,a*h);break;case"YXY":i.set(c*f,a*l,c*p,a*h);break;case"ZYZ":i.set(c*p,c*f,a*l,a*h);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function fs(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function $e(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var Bn={DEG2RAD:cr,RAD2DEG:As,generateUUID:ai,clamp:De,euclideanModulo:ih,mapLinear:sp,inverseLerp:rp,lerp:hr,damp:op,pingpong:ap,smoothstep:lp,smootherstep:cp,randInt:hp,randFloat:up,randFloatSpread:dp,seededRandom:fp,degToRad:pp,radToDeg:mp,isPowerOfTwo:gp,ceilPowerOfTwo:xp,floorPowerOfTwo:_p,setQuaternionFromProperEuler:vp,normalize:$e,denormalize:fs},yt=class i{constructor(t=0,e=0){i.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(De(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},ee=class i{constructor(t,e,n,s,r,o,a,c,h){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,c,h)}set(t,e,n,s,r,o,a,c,h){let l=this.elements;return l[0]=t,l[1]=s,l[2]=a,l[3]=e,l[4]=r,l[5]=c,l[6]=n,l[7]=o,l[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],c=n[6],h=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],x=s[0],g=s[3],m=s[6],w=s[1],E=s[4],S=s[7],V=s[2],O=s[5],y=s[8];return r[0]=o*x+a*w+c*V,r[3]=o*g+a*E+c*O,r[6]=o*m+a*S+c*y,r[1]=h*x+l*w+u*V,r[4]=h*g+l*E+u*O,r[7]=h*m+l*S+u*y,r[2]=d*x+f*w+p*V,r[5]=d*g+f*E+p*O,r[8]=d*m+f*S+p*y,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],h=t[7],l=t[8];return e*o*l-e*a*h-n*r*l+n*a*c+s*r*h-s*o*c}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],h=t[7],l=t[8],u=l*o-a*h,d=a*c-l*r,f=h*r-o*c,p=e*u+n*d+s*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/p;return t[0]=u*x,t[1]=(s*h-l*n)*x,t[2]=(a*n-s*o)*x,t[3]=d*x,t[4]=(l*e-s*c)*x,t[5]=(s*r-a*e)*x,t[6]=f*x,t[7]=(n*c-h*e)*x,t[8]=(o*e-n*r)*x,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){let c=Math.cos(r),h=Math.sin(r);return this.set(n*c,n*h,-n*(c*o+h*a)+o+t,-s*h,s*c,-s*(-h*o+c*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(qa.makeScale(t,e)),this}rotate(t){return this.premultiply(qa.makeRotation(-t)),this}translate(t,e){return this.premultiply(qa.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},qa=new ee;function Td(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Lo(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function yp(){let i=Lo("canvas");return i.style.display="block",i}var nu={};function ar(i){i in nu||(nu[i]=!0,console.warn(i))}function Mp(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function bp(i){let t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Sp(i){let t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}var oe={enabled:!0,workingColorSpace:zs,spaces:{},convert:function(i,t,e){return this.enabled===!1||t===e||!t||!e||(this.spaces[t].transfer===_e&&(i.r=ti(i.r),i.g=ti(i.g),i.b=ti(i.b)),this.spaces[t].primaries!==this.spaces[e].primaries&&(i.applyMatrix3(this.spaces[t].toXYZ),i.applyMatrix3(this.spaces[e].fromXYZ)),this.spaces[e].transfer===_e&&(i.r=ys(i.r),i.g=ys(i.g),i.b=ys(i.b))),i},fromWorkingColorSpace:function(i,t){return this.convert(i,this.workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===_i?ca:this.spaces[i].transfer},getLuminanceCoefficients:function(i,t=this.workingColorSpace){return i.fromArray(this.spaces[t].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,t,e){return i.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}};function ti(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function ys(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var iu=[.64,.33,.3,.6,.15,.06],su=[.2126,.7152,.0722],ru=[.3127,.329],ou=new ee().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),au=new ee().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);oe.define({[zs]:{primaries:iu,whitePoint:ru,transfer:ca,toXYZ:ou,fromXYZ:au,luminanceCoefficients:su,workingColorSpaceConfig:{unpackColorSpace:Pe},outputColorSpaceConfig:{drawingBufferColorSpace:Pe}},[Pe]:{primaries:iu,whitePoint:ru,transfer:_e,toXYZ:ou,fromXYZ:au,luminanceCoefficients:su,outputColorSpaceConfig:{drawingBufferColorSpace:Pe}}});var Qi,hc=class{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Qi===void 0&&(Qi=Lo("canvas")),Qi.width=t.width,Qi.height=t.height;let n=Qi.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Qi}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Lo("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=ti(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(ti(e[n]/255)*255):e[n]=ti(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},wp=0,Uo=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:wp++}),this.uuid=ai(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Ya(s[o].image)):r.push(Ya(s[o]))}else r=Ya(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Ya(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?hc.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Ep=0,We=class i extends kn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=Nn,s=Nn,r=Fn,o=jn,a=gn,c=ei,h=i.DEFAULT_ANISOTROPY,l=_i){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ep++}),this.uuid=ai(),this.name="",this.source=new Uo(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=h,this.format=a,this.internalFormat=null,this.type=c,this.offset=new yt(0,0),this.repeat=new yt(1,1),this.center=new yt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ee,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=l,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==pd)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case On:t.x=t.x-Math.floor(t.x);break;case Nn:t.x=t.x<0?0:1;break;case Fl:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case On:t.y=t.y-Math.floor(t.y);break;case Nn:t.y=t.y<0?0:1;break;case Fl:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};We.DEFAULT_IMAGE=null;We.DEFAULT_MAPPING=pd;We.DEFAULT_ANISOTROPY=1;var ce=class i{constructor(t=0,e=0,n=0,s=1){i.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,c=t.elements,h=c[0],l=c[4],u=c[8],d=c[1],f=c[5],p=c[9],x=c[2],g=c[6],m=c[10];if(Math.abs(l-d)<.01&&Math.abs(u-x)<.01&&Math.abs(p-g)<.01){if(Math.abs(l+d)<.1&&Math.abs(u+x)<.1&&Math.abs(p+g)<.1&&Math.abs(h+f+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let E=(h+1)/2,S=(f+1)/2,V=(m+1)/2,O=(l+d)/4,y=(u+x)/4,R=(p+g)/4;return E>S&&E>V?E<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(E),s=O/n,r=y/n):S>V?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=O/s,r=R/s):V<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(V),n=y/r,s=R/r),this.set(n,s,r,e),this}let w=Math.sqrt((g-p)*(g-p)+(u-x)*(u-x)+(d-l)*(d-l));return Math.abs(w)<.001&&(w=1),this.x=(g-p)/w,this.y=(u-x)/w,this.z=(d-l)/w,this.w=Math.acos((h+f+m-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},uc=class extends kn{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new ce(0,0,t,e),this.scissorTest=!1,this.viewport=new ce(0,0,t,e);let s={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Fn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);let r=new We(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,s=t.textures.length;n<s;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;let e=Object.assign({},t.texture.image);return this.texture.source=new Uo(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},je=class extends uc{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},No=class extends We{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ke,this.minFilter=Ke,this.wrapR=Nn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var dc=class extends We{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ke,this.minFilter=Ke,this.wrapR=Nn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ke=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let c=n[s+0],h=n[s+1],l=n[s+2],u=n[s+3],d=r[o+0],f=r[o+1],p=r[o+2],x=r[o+3];if(a===0){t[e+0]=c,t[e+1]=h,t[e+2]=l,t[e+3]=u;return}if(a===1){t[e+0]=d,t[e+1]=f,t[e+2]=p,t[e+3]=x;return}if(u!==x||c!==d||h!==f||l!==p){let g=1-a,m=c*d+h*f+l*p+u*x,w=m>=0?1:-1,E=1-m*m;if(E>Number.EPSILON){let V=Math.sqrt(E),O=Math.atan2(V,m*w);g=Math.sin(g*O)/V,a=Math.sin(a*O)/V}let S=a*w;if(c=c*g+d*S,h=h*g+f*S,l=l*g+p*S,u=u*g+x*S,g===1-a){let V=1/Math.sqrt(c*c+h*h+l*l+u*u);c*=V,h*=V,l*=V,u*=V}}t[e]=c,t[e+1]=h,t[e+2]=l,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,s,r,o){let a=n[s],c=n[s+1],h=n[s+2],l=n[s+3],u=r[o],d=r[o+1],f=r[o+2],p=r[o+3];return t[e]=a*p+l*u+c*f-h*d,t[e+1]=c*p+l*d+h*u-a*f,t[e+2]=h*p+l*f+a*d-c*u,t[e+3]=l*p-a*u-c*d-h*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,c=Math.sin,h=a(n/2),l=a(s/2),u=a(r/2),d=c(n/2),f=c(s/2),p=c(r/2);switch(o){case"XYZ":this._x=d*l*u+h*f*p,this._y=h*f*u-d*l*p,this._z=h*l*p+d*f*u,this._w=h*l*u-d*f*p;break;case"YXZ":this._x=d*l*u+h*f*p,this._y=h*f*u-d*l*p,this._z=h*l*p-d*f*u,this._w=h*l*u+d*f*p;break;case"ZXY":this._x=d*l*u-h*f*p,this._y=h*f*u+d*l*p,this._z=h*l*p+d*f*u,this._w=h*l*u-d*f*p;break;case"ZYX":this._x=d*l*u-h*f*p,this._y=h*f*u+d*l*p,this._z=h*l*p-d*f*u,this._w=h*l*u+d*f*p;break;case"YZX":this._x=d*l*u+h*f*p,this._y=h*f*u+d*l*p,this._z=h*l*p-d*f*u,this._w=h*l*u-d*f*p;break;case"XZY":this._x=d*l*u-h*f*p,this._y=h*f*u-d*l*p,this._z=h*l*p+d*f*u,this._w=h*l*u+d*f*p;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],c=e[9],h=e[2],l=e[6],u=e[10],d=n+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(l-c)*f,this._y=(r-h)*f,this._z=(o-s)*f}else if(n>a&&n>u){let f=2*Math.sqrt(1+n-a-u);this._w=(l-c)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+h)/f}else if(a>u){let f=2*Math.sqrt(1+a-n-u);this._w=(r-h)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(c+l)/f}else{let f=2*Math.sqrt(1+u-n-a);this._w=(o-s)/f,this._x=(r+h)/f,this._y=(c+l)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(De(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,c=e._y,h=e._z,l=e._w;return this._x=n*l+o*a+s*h-r*c,this._y=s*l+o*c+r*a-n*h,this._z=r*l+o*h+n*c-s*a,this._w=o*l-n*a-s*c-r*h,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let n=this._x,s=this._y,r=this._z,o=this._w,a=o*t._w+n*t._x+s*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;let c=1-a*a;if(c<=Number.EPSILON){let f=1-e;return this._w=f*o+e*this._w,this._x=f*n+e*this._x,this._y=f*s+e*this._y,this._z=f*r+e*this._z,this.normalize(),this}let h=Math.sqrt(c),l=Math.atan2(h,a),u=Math.sin((1-e)*l)/h,d=Math.sin(e*l)/h;return this._w=o*u+this._w*d,this._x=n*u+this._x*d,this._y=s*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},I=class i{constructor(t=0,e=0,n=0){i.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(lu.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(lu.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,c=t.w,h=2*(o*s-a*n),l=2*(a*e-r*s),u=2*(r*n-o*e);return this.x=e+c*h+o*u-a*l,this.y=n+c*l+a*h-r*u,this.z=s+c*u+r*l-o*h,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,c=e.z;return this.x=s*c-r*a,this.y=r*o-n*c,this.z=n*a-s*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Za.copy(this).projectOnVector(t),this.sub(Za)}reflect(t){return this.sub(Za.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(De(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Za=new I,lu=new ke,xn=class{constructor(t=new I(1/0,1/0,1/0),e=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Tn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Tn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=Tn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Tn):Tn.fromBufferAttribute(r,o),Tn.applyMatrix4(t.matrixWorld),this.expandByPoint(Tn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Kr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Kr.copy(n.boundingBox)),Kr.applyMatrix4(t.matrixWorld),this.union(Kr)}let s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Tn),Tn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(tr),jr.subVectors(this.max,tr),ts.subVectors(t.a,tr),es.subVectors(t.b,tr),ns.subVectors(t.c,tr),di.subVectors(es,ts),fi.subVectors(ns,es),Di.subVectors(ts,ns);let e=[0,-di.z,di.y,0,-fi.z,fi.y,0,-Di.z,Di.y,di.z,0,-di.x,fi.z,0,-fi.x,Di.z,0,-Di.x,-di.y,di.x,0,-fi.y,fi.x,0,-Di.y,Di.x,0];return!$a(e,ts,es,ns,jr)||(e=[1,0,0,0,1,0,0,0,1],!$a(e,ts,es,ns,jr))?!1:(Qr.crossVectors(di,fi),e=[Qr.x,Qr.y,Qr.z],$a(e,ts,es,ns,jr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Tn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Tn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(qn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),qn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),qn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),qn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),qn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),qn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),qn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),qn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(qn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}},qn=[new I,new I,new I,new I,new I,new I,new I,new I],Tn=new I,Kr=new xn,ts=new I,es=new I,ns=new I,di=new I,fi=new I,Di=new I,tr=new I,jr=new I,Qr=new I,Li=new I;function $a(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Li.fromArray(i,r);let a=s.x*Math.abs(Li.x)+s.y*Math.abs(Li.y)+s.z*Math.abs(Li.z),c=t.dot(Li),h=e.dot(Li),l=n.dot(Li);if(Math.max(-Math.max(c,h,l),Math.min(c,h,l))>a)return!1}return!0}var Tp=new xn,er=new I,Ja=new I,ii=class{constructor(t=new I,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):Tp.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;er.subVectors(t,this.center);let e=er.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(er,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Ja.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(er.copy(t.center).add(Ja)),this.expandByPoint(er.copy(t.center).sub(Ja))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}},Yn=new I,Ka=new I,to=new I,pi=new I,ja=new I,eo=new I,Qa=new I,Vi=class{constructor(t=new I,e=new I(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Yn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Yn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Yn.copy(this.origin).addScaledVector(this.direction,e),Yn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Ka.copy(t).add(e).multiplyScalar(.5),to.copy(e).sub(t).normalize(),pi.copy(this.origin).sub(Ka);let r=t.distanceTo(e)*.5,o=-this.direction.dot(to),a=pi.dot(this.direction),c=-pi.dot(to),h=pi.lengthSq(),l=Math.abs(1-o*o),u,d,f,p;if(l>0)if(u=o*c-a,d=o*a-c,p=r*l,u>=0)if(d>=-p)if(d<=p){let x=1/l;u*=x,d*=x,f=u*(u+o*d+2*a)+d*(o*u+d+2*c)+h}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*c)+h;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*c)+h;else d<=-p?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+h):d<=p?(u=0,d=Math.min(Math.max(-r,-c),r),f=d*(d+2*c)+h):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+h);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*c)+h;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Ka).addScaledVector(to,d),f}intersectSphere(t,e){Yn.subVectors(t.center,this.origin);let n=Yn.dot(this.direction),s=Yn.dot(Yn)-n*n,r=t.radius*t.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,c,h=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return h>=0?(n=(t.min.x-d.x)*h,s=(t.max.x-d.x)*h):(n=(t.max.x-d.x)*h,s=(t.min.x-d.x)*h),l>=0?(r=(t.min.y-d.y)*l,o=(t.max.y-d.y)*l):(r=(t.max.y-d.y)*l,o=(t.min.y-d.y)*l),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(t.min.z-d.z)*u,c=(t.max.z-d.z)*u):(a=(t.max.z-d.z)*u,c=(t.min.z-d.z)*u),n>c||a>s)||((a>n||n!==n)&&(n=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Yn)!==null}intersectTriangle(t,e,n,s,r){ja.subVectors(e,t),eo.subVectors(n,t),Qa.crossVectors(ja,eo);let o=this.direction.dot(Qa),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;pi.subVectors(this.origin,t);let c=a*this.direction.dot(eo.crossVectors(pi,eo));if(c<0)return null;let h=a*this.direction.dot(ja.cross(pi));if(h<0||c+h>o)return null;let l=-a*pi.dot(Qa);return l<0?null:this.at(l/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Yt=class i{constructor(t,e,n,s,r,o,a,c,h,l,u,d,f,p,x,g){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,c,h,l,u,d,f,p,x,g)}set(t,e,n,s,r,o,a,c,h,l,u,d,f,p,x,g){let m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=s,m[1]=r,m[5]=o,m[9]=a,m[13]=c,m[2]=h,m[6]=l,m[10]=u,m[14]=d,m[3]=f,m[7]=p,m[11]=x,m[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){let e=this.elements,n=t.elements,s=1/is.setFromMatrixColumn(t,0).length(),r=1/is.setFromMatrixColumn(t,1).length(),o=1/is.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(s),h=Math.sin(s),l=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let d=o*l,f=o*u,p=a*l,x=a*u;e[0]=c*l,e[4]=-c*u,e[8]=h,e[1]=f+p*h,e[5]=d-x*h,e[9]=-a*c,e[2]=x-d*h,e[6]=p+f*h,e[10]=o*c}else if(t.order==="YXZ"){let d=c*l,f=c*u,p=h*l,x=h*u;e[0]=d+x*a,e[4]=p*a-f,e[8]=o*h,e[1]=o*u,e[5]=o*l,e[9]=-a,e[2]=f*a-p,e[6]=x+d*a,e[10]=o*c}else if(t.order==="ZXY"){let d=c*l,f=c*u,p=h*l,x=h*u;e[0]=d-x*a,e[4]=-o*u,e[8]=p+f*a,e[1]=f+p*a,e[5]=o*l,e[9]=x-d*a,e[2]=-o*h,e[6]=a,e[10]=o*c}else if(t.order==="ZYX"){let d=o*l,f=o*u,p=a*l,x=a*u;e[0]=c*l,e[4]=p*h-f,e[8]=d*h+x,e[1]=c*u,e[5]=x*h+d,e[9]=f*h-p,e[2]=-h,e[6]=a*c,e[10]=o*c}else if(t.order==="YZX"){let d=o*c,f=o*h,p=a*c,x=a*h;e[0]=c*l,e[4]=x-d*u,e[8]=p*u+f,e[1]=u,e[5]=o*l,e[9]=-a*l,e[2]=-h*l,e[6]=f*u+p,e[10]=d-x*u}else if(t.order==="XZY"){let d=o*c,f=o*h,p=a*c,x=a*h;e[0]=c*l,e[4]=-u,e[8]=h*l,e[1]=d*u+x,e[5]=o*l,e[9]=f*u-p,e[2]=p*u-f,e[6]=a*l,e[10]=x*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Ap,t,Rp)}lookAt(t,e,n){let s=this.elements;return ln.subVectors(t,e),ln.lengthSq()===0&&(ln.z=1),ln.normalize(),mi.crossVectors(n,ln),mi.lengthSq()===0&&(Math.abs(n.z)===1?ln.x+=1e-4:ln.z+=1e-4,ln.normalize(),mi.crossVectors(n,ln)),mi.normalize(),no.crossVectors(ln,mi),s[0]=mi.x,s[4]=no.x,s[8]=ln.x,s[1]=mi.y,s[5]=no.y,s[9]=ln.y,s[2]=mi.z,s[6]=no.z,s[10]=ln.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],c=n[8],h=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],x=n[6],g=n[10],m=n[14],w=n[3],E=n[7],S=n[11],V=n[15],O=s[0],y=s[4],R=s[8],A=s[12],b=s[1],D=s[5],W=s[9],Z=s[13],J=s[2],rt=s[6],K=s[10],ct=s[14],tt=s[3],et=s[7],_t=s[11],It=s[15];return r[0]=o*O+a*b+c*J+h*tt,r[4]=o*y+a*D+c*rt+h*et,r[8]=o*R+a*W+c*K+h*_t,r[12]=o*A+a*Z+c*ct+h*It,r[1]=l*O+u*b+d*J+f*tt,r[5]=l*y+u*D+d*rt+f*et,r[9]=l*R+u*W+d*K+f*_t,r[13]=l*A+u*Z+d*ct+f*It,r[2]=p*O+x*b+g*J+m*tt,r[6]=p*y+x*D+g*rt+m*et,r[10]=p*R+x*W+g*K+m*_t,r[14]=p*A+x*Z+g*ct+m*It,r[3]=w*O+E*b+S*J+V*tt,r[7]=w*y+E*D+S*rt+V*et,r[11]=w*R+E*W+S*K+V*_t,r[15]=w*A+E*Z+S*ct+V*It,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],c=t[9],h=t[13],l=t[2],u=t[6],d=t[10],f=t[14],p=t[3],x=t[7],g=t[11],m=t[15];return p*(+r*c*u-s*h*u-r*a*d+n*h*d+s*a*f-n*c*f)+x*(+e*c*f-e*h*d+r*o*d-s*o*f+s*h*l-r*c*l)+g*(+e*h*u-e*a*f-r*o*u+n*o*f+r*a*l-n*h*l)+m*(-s*a*l-e*c*u+e*a*d+s*o*u-n*o*d+n*c*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],h=t[7],l=t[8],u=t[9],d=t[10],f=t[11],p=t[12],x=t[13],g=t[14],m=t[15],w=u*g*h-x*d*h+x*c*f-a*g*f-u*c*m+a*d*m,E=p*d*h-l*g*h-p*c*f+o*g*f+l*c*m-o*d*m,S=l*x*h-p*u*h+p*a*f-o*x*f-l*a*m+o*u*m,V=p*u*c-l*x*c-p*a*d+o*x*d+l*a*g-o*u*g,O=e*w+n*E+s*S+r*V;if(O===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let y=1/O;return t[0]=w*y,t[1]=(x*d*r-u*g*r-x*s*f+n*g*f+u*s*m-n*d*m)*y,t[2]=(a*g*r-x*c*r+x*s*h-n*g*h-a*s*m+n*c*m)*y,t[3]=(u*c*r-a*d*r-u*s*h+n*d*h+a*s*f-n*c*f)*y,t[4]=E*y,t[5]=(l*g*r-p*d*r+p*s*f-e*g*f-l*s*m+e*d*m)*y,t[6]=(p*c*r-o*g*r-p*s*h+e*g*h+o*s*m-e*c*m)*y,t[7]=(o*d*r-l*c*r+l*s*h-e*d*h-o*s*f+e*c*f)*y,t[8]=S*y,t[9]=(p*u*r-l*x*r-p*n*f+e*x*f+l*n*m-e*u*m)*y,t[10]=(o*x*r-p*a*r+p*n*h-e*x*h-o*n*m+e*a*m)*y,t[11]=(l*a*r-o*u*r-l*n*h+e*u*h+o*n*f-e*a*f)*y,t[12]=V*y,t[13]=(l*x*s-p*u*s+p*n*d-e*x*d-l*n*g+e*u*g)*y,t[14]=(p*a*s-o*x*s-p*n*c+e*x*c+o*n*g-e*a*g)*y,t[15]=(o*u*s-l*a*s+l*n*c-e*u*c-o*n*d+e*a*d)*y,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,c=t.z,h=r*o,l=r*a;return this.set(h*o+n,h*a-s*c,h*c+s*a,0,h*a+s*c,l*a+n,l*c-s*o,0,h*c-s*a,l*c+s*o,r*c*c+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,o=e._y,a=e._z,c=e._w,h=r+r,l=o+o,u=a+a,d=r*h,f=r*l,p=r*u,x=o*l,g=o*u,m=a*u,w=c*h,E=c*l,S=c*u,V=n.x,O=n.y,y=n.z;return s[0]=(1-(x+m))*V,s[1]=(f+S)*V,s[2]=(p-E)*V,s[3]=0,s[4]=(f-S)*O,s[5]=(1-(d+m))*O,s[6]=(g+w)*O,s[7]=0,s[8]=(p+E)*y,s[9]=(g-w)*y,s[10]=(1-(d+x))*y,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements,r=is.set(s[0],s[1],s[2]).length(),o=is.set(s[4],s[5],s[6]).length(),a=is.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],An.copy(this);let h=1/r,l=1/o,u=1/a;return An.elements[0]*=h,An.elements[1]*=h,An.elements[2]*=h,An.elements[4]*=l,An.elements[5]*=l,An.elements[6]*=l,An.elements[8]*=u,An.elements[9]*=u,An.elements[10]*=u,e.setFromRotationMatrix(An),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,s,r,o,a=Qn){let c=this.elements,h=2*r/(e-t),l=2*r/(n-s),u=(e+t)/(e-t),d=(n+s)/(n-s),f,p;if(a===Qn)f=-(o+r)/(o-r),p=-2*o*r/(o-r);else if(a===Do)f=-o/(o-r),p=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=l,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=f,c[14]=p,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=Qn){let c=this.elements,h=1/(e-t),l=1/(n-s),u=1/(o-r),d=(e+t)*h,f=(n+s)*l,p,x;if(a===Qn)p=(o+r)*u,x=-2*u;else if(a===Do)p=r*u,x=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=2*h,c[4]=0,c[8]=0,c[12]=-d,c[1]=0,c[5]=2*l,c[9]=0,c[13]=-f,c[2]=0,c[6]=0,c[10]=x,c[14]=-p,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},is=new I,An=new Yt,Ap=new I(0,0,0),Rp=new I(1,1,1),mi=new I,no=new I,ln=new I,cu=new Yt,hu=new ke,zn=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],o=s[4],a=s[8],c=s[1],h=s[5],l=s[9],u=s[2],d=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(De(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,h),this._z=0);break;case"YXZ":this._x=Math.asin(-De(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,h)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(De(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,h)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-De(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,h));break;case"YZX":this._z=Math.asin(De(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-l,h),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-De(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,h),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-l,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return cu.makeRotationFromQuaternion(t),this.setFromRotationMatrix(cu,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return hu.setFromEuler(this),this.setFromQuaternion(hu,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};zn.DEFAULT_ORDER="XYZ";var gr=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Cp=0,uu=new I,ss=new ke,Zn=new Yt,io=new I,nr=new I,Pp=new I,Ip=new ke,du=new I(1,0,0),fu=new I(0,1,0),pu=new I(0,0,1),mu={type:"added"},Dp={type:"removed"},rs={type:"childadded",child:null},tl={type:"childremoved",child:null},ze=class i extends kn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Cp++}),this.uuid=ai(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new I,e=new zn,n=new ke,s=new I(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Yt},normalMatrix:{value:new ee}}),this.matrix=new Yt,this.matrixWorld=new Yt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new gr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return ss.setFromAxisAngle(t,e),this.quaternion.multiply(ss),this}rotateOnWorldAxis(t,e){return ss.setFromAxisAngle(t,e),this.quaternion.premultiply(ss),this}rotateX(t){return this.rotateOnAxis(du,t)}rotateY(t){return this.rotateOnAxis(fu,t)}rotateZ(t){return this.rotateOnAxis(pu,t)}translateOnAxis(t,e){return uu.copy(t).applyQuaternion(this.quaternion),this.position.add(uu.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(du,t)}translateY(t){return this.translateOnAxis(fu,t)}translateZ(t){return this.translateOnAxis(pu,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Zn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?io.copy(t):io.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),nr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Zn.lookAt(nr,io,this.up):Zn.lookAt(io,nr,this.up),this.quaternion.setFromRotationMatrix(Zn),s&&(Zn.extractRotation(s.matrixWorld),ss.setFromRotationMatrix(Zn),this.quaternion.premultiply(ss.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(mu),rs.child=t,this.dispatchEvent(rs),rs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Dp),tl.child=t,this.dispatchEvent(tl),tl.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Zn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Zn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Zn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(mu),rs.child=t,this.dispatchEvent(rs),rs.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(nr,t,Pp),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(nr,Ip,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let h=0,l=c.length;h<l;h++){let u=c[h];r(t.shapes,u)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,h=this.material.length;c<h;c++)a.push(r(t.materials,this.material[c]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];s.animations.push(r(t.animations,c))}}if(e){let a=o(t.geometries),c=o(t.materials),h=o(t.textures),l=o(t.images),u=o(t.shapes),d=o(t.skeletons),f=o(t.animations),p=o(t.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),h.length>0&&(n.textures=h),l.length>0&&(n.images=l),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),p.length>0&&(n.nodes=p)}return n.object=s,n;function o(a){let c=[];for(let h in a){let l=a[h];delete l.metadata,c.push(l)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}};ze.DEFAULT_UP=new I(0,1,0);ze.DEFAULT_MATRIX_AUTO_UPDATE=!0;ze.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Rn=new I,$n=new I,el=new I,Jn=new I,os=new I,as=new I,gu=new I,nl=new I,il=new I,sl=new I,rl=new ce,ol=new ce,al=new ce,Bi=class i{constructor(t=new I,e=new I,n=new I){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Rn.subVectors(t,e),s.cross(Rn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){Rn.subVectors(s,e),$n.subVectors(n,e),el.subVectors(t,e);let o=Rn.dot(Rn),a=Rn.dot($n),c=Rn.dot(el),h=$n.dot($n),l=$n.dot(el),u=o*h-a*a;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(h*c-a*l)*d,p=(o*l-a*c)*d;return r.set(1-f-p,p,f)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Jn)===null?!1:Jn.x>=0&&Jn.y>=0&&Jn.x+Jn.y<=1}static getInterpolation(t,e,n,s,r,o,a,c){return this.getBarycoord(t,e,n,s,Jn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Jn.x),c.addScaledVector(o,Jn.y),c.addScaledVector(a,Jn.z),c)}static getInterpolatedAttribute(t,e,n,s,r,o){return rl.setScalar(0),ol.setScalar(0),al.setScalar(0),rl.fromBufferAttribute(t,e),ol.fromBufferAttribute(t,n),al.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(rl,r.x),o.addScaledVector(ol,r.y),o.addScaledVector(al,r.z),o}static isFrontFacing(t,e,n,s){return Rn.subVectors(n,e),$n.subVectors(t,e),Rn.cross($n).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Rn.subVectors(this.c,this.b),$n.subVectors(this.a,this.b),Rn.cross($n).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,o,a;os.subVectors(s,n),as.subVectors(r,n),nl.subVectors(t,n);let c=os.dot(nl),h=as.dot(nl);if(c<=0&&h<=0)return e.copy(n);il.subVectors(t,s);let l=os.dot(il),u=as.dot(il);if(l>=0&&u<=l)return e.copy(s);let d=c*u-l*h;if(d<=0&&c>=0&&l<=0)return o=c/(c-l),e.copy(n).addScaledVector(os,o);sl.subVectors(t,r);let f=os.dot(sl),p=as.dot(sl);if(p>=0&&f<=p)return e.copy(r);let x=f*h-c*p;if(x<=0&&h>=0&&p<=0)return a=h/(h-p),e.copy(n).addScaledVector(as,a);let g=l*p-f*u;if(g<=0&&u-l>=0&&f-p>=0)return gu.subVectors(r,s),a=(u-l)/(u-l+(f-p)),e.copy(s).addScaledVector(gu,a);let m=1/(g+x+d);return o=x*m,a=d*m,e.copy(n).addScaledVector(os,o).addScaledVector(as,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Ad={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},gi={h:0,s:0,l:0},so={h:0,s:0,l:0};function ll(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var Wt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Pe){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,oe.toWorkingColorSpace(this,e),this}setRGB(t,e,n,s=oe.workingColorSpace){return this.r=t,this.g=e,this.b=n,oe.toWorkingColorSpace(this,s),this}setHSL(t,e,n,s=oe.workingColorSpace){if(t=ih(t,1),e=De(e,0,1),n=De(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=ll(o,r,t+1/3),this.g=ll(o,r,t),this.b=ll(o,r,t-1/3)}return oe.toWorkingColorSpace(this,s),this}setStyle(t,e=Pe){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Pe){let n=Ad[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ti(t.r),this.g=ti(t.g),this.b=ti(t.b),this}copyLinearToSRGB(t){return this.r=ys(t.r),this.g=ys(t.g),this.b=ys(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Pe){return oe.fromWorkingColorSpace(Ve.copy(this),t),Math.round(De(Ve.r*255,0,255))*65536+Math.round(De(Ve.g*255,0,255))*256+Math.round(De(Ve.b*255,0,255))}getHexString(t=Pe){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=oe.workingColorSpace){oe.fromWorkingColorSpace(Ve.copy(this),e);let n=Ve.r,s=Ve.g,r=Ve.b,o=Math.max(n,s,r),a=Math.min(n,s,r),c,h,l=(a+o)/2;if(a===o)c=0,h=0;else{let u=o-a;switch(h=l<=.5?u/(o+a):u/(2-o-a),o){case n:c=(s-r)/u+(s<r?6:0);break;case s:c=(r-n)/u+2;break;case r:c=(n-s)/u+4;break}c/=6}return t.h=c,t.s=h,t.l=l,t}getRGB(t,e=oe.workingColorSpace){return oe.fromWorkingColorSpace(Ve.copy(this),e),t.r=Ve.r,t.g=Ve.g,t.b=Ve.b,t}getStyle(t=Pe){oe.fromWorkingColorSpace(Ve.copy(this),t);let e=Ve.r,n=Ve.g,s=Ve.b;return t!==Pe?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(gi),this.setHSL(gi.h+t,gi.s+e,gi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(gi),t.getHSL(so);let n=hr(gi.h,so.h,e),s=hr(gi.s,so.s,e),r=hr(gi.l,so.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ve=new Wt;Wt.NAMES=Ad;var Lp=0,Gi=class extends kn{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Lp++}),this.uuid=ai(),this.name="",this.blending=_s,this.side=Mi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=El,this.blendDst=Tl,this.blendEquation=zi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Wt(0,0,0),this.blendAlpha=0,this.depthFunc=bs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=jh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ji,this.stencilZFail=ji,this.stencilZPass=ji,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==_s&&(n.blending=this.blending),this.side!==Mi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==El&&(n.blendSrc=this.blendSrc),this.blendDst!==Tl&&(n.blendDst=this.blendDst),this.blendEquation!==zi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==bs&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==jh&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ji&&(n.stencilFail=this.stencilFail),this.stencilZFail!==ji&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==ji&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let c=r[a];delete c.metadata,o.push(c)}return o}if(e){let r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},Ee=class extends Gi{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new Wt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new zn,this.combine=fd,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}};var Ce=new I,ro=new yt,Te=class{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Qh,this.updateRanges=[],this.gpuType=Cn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)ro.fromBufferAttribute(this,e),ro.applyMatrix3(t),this.setXY(e,ro.x,ro.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ce.fromBufferAttribute(this,e),Ce.applyMatrix3(t),this.setXYZ(e,Ce.x,Ce.y,Ce.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ce.fromBufferAttribute(this,e),Ce.applyMatrix4(t),this.setXYZ(e,Ce.x,Ce.y,Ce.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ce.fromBufferAttribute(this,e),Ce.applyNormalMatrix(t),this.setXYZ(e,Ce.x,Ce.y,Ce.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ce.fromBufferAttribute(this,e),Ce.transformDirection(t),this.setXYZ(e,Ce.x,Ce.y,Ce.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=fs(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=$e(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=fs(e,this.array)),e}setX(t,e){return this.normalized&&(e=$e(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=fs(e,this.array)),e}setY(t,e){return this.normalized&&(e=$e(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=fs(e,this.array)),e}setZ(t,e){return this.normalized&&(e=$e(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=fs(e,this.array)),e}setW(t,e){return this.normalized&&(e=$e(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=$e(e,this.array),n=$e(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=$e(e,this.array),n=$e(n,this.array),s=$e(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=$e(e,this.array),n=$e(n,this.array),s=$e(s,this.array),r=$e(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Qh&&(t.usage=this.usage),t}};var Fo=class extends Te{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var Oo=class extends Te{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var we=class extends Te{constructor(t,e,n){super(new Float32Array(t),e,n)}},Up=0,mn=new Yt,cl=new ze,ls=new I,cn=new xn,ir=new xn,Fe=new I,Xe=class i extends kn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Up++}),this.uuid=ai(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Td(t)?Oo:Fo)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ee().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return mn.makeRotationFromQuaternion(t),this.applyMatrix4(mn),this}rotateX(t){return mn.makeRotationX(t),this.applyMatrix4(mn),this}rotateY(t){return mn.makeRotationY(t),this.applyMatrix4(mn),this}rotateZ(t){return mn.makeRotationZ(t),this.applyMatrix4(mn),this}translate(t,e,n){return mn.makeTranslation(t,e,n),this.applyMatrix4(mn),this}scale(t,e,n){return mn.makeScale(t,e,n),this.applyMatrix4(mn),this}lookAt(t){return cl.lookAt(t),cl.updateMatrix(),this.applyMatrix4(cl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ls).negate(),this.translate(ls.x,ls.y,ls.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let o=t[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new we(n,3))}else{for(let n=0,s=e.count;n<s;n++){let r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new xn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];cn.setFromBufferAttribute(r),this.morphTargetsRelative?(Fe.addVectors(this.boundingBox.min,cn.min),this.boundingBox.expandByPoint(Fe),Fe.addVectors(this.boundingBox.max,cn.max),this.boundingBox.expandByPoint(Fe)):(this.boundingBox.expandByPoint(cn.min),this.boundingBox.expandByPoint(cn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ii);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(t){let n=this.boundingSphere.center;if(cn.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];ir.setFromBufferAttribute(a),this.morphTargetsRelative?(Fe.addVectors(cn.min,ir.min),cn.expandByPoint(Fe),Fe.addVectors(cn.max,ir.max),cn.expandByPoint(Fe)):(cn.expandByPoint(ir.min),cn.expandByPoint(ir.max))}cn.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)Fe.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Fe));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],c=this.morphTargetsRelative;for(let h=0,l=a.count;h<l;h++)Fe.fromBufferAttribute(a,h),c&&(ls.fromBufferAttribute(t,h),Fe.add(ls)),s=Math.max(s,n.distanceToSquared(Fe))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Te(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],c=[];for(let R=0;R<n.count;R++)a[R]=new I,c[R]=new I;let h=new I,l=new I,u=new I,d=new yt,f=new yt,p=new yt,x=new I,g=new I;function m(R,A,b){h.fromBufferAttribute(n,R),l.fromBufferAttribute(n,A),u.fromBufferAttribute(n,b),d.fromBufferAttribute(r,R),f.fromBufferAttribute(r,A),p.fromBufferAttribute(r,b),l.sub(h),u.sub(h),f.sub(d),p.sub(d);let D=1/(f.x*p.y-p.x*f.y);isFinite(D)&&(x.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(D),g.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(D),a[R].add(x),a[A].add(x),a[b].add(x),c[R].add(g),c[A].add(g),c[b].add(g))}let w=this.groups;w.length===0&&(w=[{start:0,count:t.count}]);for(let R=0,A=w.length;R<A;++R){let b=w[R],D=b.start,W=b.count;for(let Z=D,J=D+W;Z<J;Z+=3)m(t.getX(Z+0),t.getX(Z+1),t.getX(Z+2))}let E=new I,S=new I,V=new I,O=new I;function y(R){V.fromBufferAttribute(s,R),O.copy(V);let A=a[R];E.copy(A),E.sub(V.multiplyScalar(V.dot(A))).normalize(),S.crossVectors(O,A);let D=S.dot(c[R])<0?-1:1;o.setXYZW(R,E.x,E.y,E.z,D)}for(let R=0,A=w.length;R<A;++R){let b=w[R],D=b.start,W=b.count;for(let Z=D,J=D+W;Z<J;Z+=3)y(t.getX(Z+0)),y(t.getX(Z+1)),y(t.getX(Z+2))}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Te(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let s=new I,r=new I,o=new I,a=new I,c=new I,h=new I,l=new I,u=new I;if(t)for(let d=0,f=t.count;d<f;d+=3){let p=t.getX(d+0),x=t.getX(d+1),g=t.getX(d+2);s.fromBufferAttribute(e,p),r.fromBufferAttribute(e,x),o.fromBufferAttribute(e,g),l.subVectors(o,r),u.subVectors(s,r),l.cross(u),a.fromBufferAttribute(n,p),c.fromBufferAttribute(n,x),h.fromBufferAttribute(n,g),a.add(l),c.add(l),h.add(l),n.setXYZ(p,a.x,a.y,a.z),n.setXYZ(x,c.x,c.y,c.z),n.setXYZ(g,h.x,h.y,h.z)}else for(let d=0,f=e.count;d<f;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),l.subVectors(o,r),u.subVectors(s,r),l.cross(u),n.setXYZ(d+0,l.x,l.y,l.z),n.setXYZ(d+1,l.x,l.y,l.z),n.setXYZ(d+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Fe.fromBufferAttribute(t,e),Fe.normalize(),t.setXYZ(e,Fe.x,Fe.y,Fe.z)}toNonIndexed(){function t(a,c){let h=a.array,l=a.itemSize,u=a.normalized,d=new h.constructor(c.length*l),f=0,p=0;for(let x=0,g=c.length;x<g;x++){a.isInterleavedBufferAttribute?f=c[x]*a.data.stride+a.offset:f=c[x]*l;for(let m=0;m<l;m++)d[p++]=h[f++]}return new Te(d,l,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let a in s){let c=s[a],h=t(c,n);e.setAttribute(a,h)}let r=this.morphAttributes;for(let a in r){let c=[],h=r[a];for(let l=0,u=h.length;l<u;l++){let d=h[l],f=t(d,n);c.push(f)}e.morphAttributes[a]=c}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let h=o[a];e.addGroup(h.start,h.count,h.materialIndex)}return e}toJSON(){let t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let h in c)c[h]!==void 0&&(t[h]=c[h]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let c in n){let h=n[c];t.data.attributes[c]=h.toJSON(t.data)}let s={},r=!1;for(let c in this.morphAttributes){let h=this.morphAttributes[c],l=[];for(let u=0,d=h.length;u<d;u++){let f=h[u];l.push(f.toJSON(t.data))}l.length>0&&(s[c]=l,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone(e));let s=t.attributes;for(let h in s){let l=s[h];this.setAttribute(h,l.clone(e))}let r=t.morphAttributes;for(let h in r){let l=[],u=r[h];for(let d=0,f=u.length;d<f;d++)l.push(u[d].clone(e));this.morphAttributes[h]=l}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let h=0,l=o.length;h<l;h++){let u=o[h];this.addGroup(u.start,u.count,u.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},xu=new Yt,Ui=new Vi,oo=new ii,_u=new I,ao=new I,lo=new I,co=new I,hl=new I,ho=new I,vu=new I,uo=new I,qt=class extends ze{constructor(t=new Xe,e=new Ee){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let a=this.morphTargetInfluences;if(r&&a){ho.set(0,0,0);for(let c=0,h=r.length;c<h;c++){let l=a[c],u=r[c];l!==0&&(hl.fromBufferAttribute(u,t),o?ho.addScaledVector(hl,l):ho.addScaledVector(hl.sub(e),l))}e.add(ho)}return e}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),oo.copy(n.boundingSphere),oo.applyMatrix4(r),Ui.copy(t.ray).recast(t.near),!(oo.containsPoint(Ui.origin)===!1&&(Ui.intersectSphere(oo,_u)===null||Ui.origin.distanceToSquared(_u)>(t.far-t.near)**2))&&(xu.copy(r).invert(),Ui.copy(t.ray).applyMatrix4(xu),!(n.boundingBox!==null&&Ui.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Ui)))}_computeIntersections(t,e,n){let s,r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,h=r.attributes.uv,l=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let p=0,x=d.length;p<x;p++){let g=d[p],m=o[g.materialIndex],w=Math.max(g.start,f.start),E=Math.min(a.count,Math.min(g.start+g.count,f.start+f.count));for(let S=w,V=E;S<V;S+=3){let O=a.getX(S),y=a.getX(S+1),R=a.getX(S+2);s=fo(this,m,t,n,h,l,u,O,y,R),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{let p=Math.max(0,f.start),x=Math.min(a.count,f.start+f.count);for(let g=p,m=x;g<m;g+=3){let w=a.getX(g),E=a.getX(g+1),S=a.getX(g+2);s=fo(this,o,t,n,h,l,u,w,E,S),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let p=0,x=d.length;p<x;p++){let g=d[p],m=o[g.materialIndex],w=Math.max(g.start,f.start),E=Math.min(c.count,Math.min(g.start+g.count,f.start+f.count));for(let S=w,V=E;S<V;S+=3){let O=S,y=S+1,R=S+2;s=fo(this,m,t,n,h,l,u,O,y,R),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{let p=Math.max(0,f.start),x=Math.min(c.count,f.start+f.count);for(let g=p,m=x;g<m;g+=3){let w=g,E=g+1,S=g+2;s=fo(this,o,t,n,h,l,u,w,E,S),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}}};function Np(i,t,e,n,s,r,o,a){let c;if(t.side===Ge?c=n.intersectTriangle(o,r,s,!0,a):c=n.intersectTriangle(s,r,o,t.side===Mi,a),c===null)return null;uo.copy(a),uo.applyMatrix4(i.matrixWorld);let h=e.ray.origin.distanceTo(uo);return h<e.near||h>e.far?null:{distance:h,point:uo.clone(),object:i}}function fo(i,t,e,n,s,r,o,a,c,h){i.getVertexPosition(a,ao),i.getVertexPosition(c,lo),i.getVertexPosition(h,co);let l=Np(i,t,e,n,ao,lo,co,vu);if(l){let u=new I;Bi.getBarycoord(vu,ao,lo,co,u),s&&(l.uv=Bi.getInterpolatedAttribute(s,a,c,h,u,new yt)),r&&(l.uv1=Bi.getInterpolatedAttribute(r,a,c,h,u,new yt)),o&&(l.normal=Bi.getInterpolatedAttribute(o,a,c,h,u,new I),l.normal.dot(n.direction)>0&&l.normal.multiplyScalar(-1));let d={a,b:c,c:h,normal:new I,materialIndex:0};Bi.getNormal(ao,lo,co,d.normal),l.face=d,l.barycoord=u}return l}var en=class i extends Xe{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let c=[],h=[],l=[],u=[],d=0,f=0;p("z","y","x",-1,-1,n,e,t,o,r,0),p("z","y","x",1,-1,n,e,-t,o,r,1),p("x","z","y",1,1,t,n,e,s,o,2),p("x","z","y",1,-1,t,n,-e,s,o,3),p("x","y","z",1,-1,t,e,n,s,r,4),p("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new we(h,3)),this.setAttribute("normal",new we(l,3)),this.setAttribute("uv",new we(u,2));function p(x,g,m,w,E,S,V,O,y,R,A){let b=S/y,D=V/R,W=S/2,Z=V/2,J=O/2,rt=y+1,K=R+1,ct=0,tt=0,et=new I;for(let _t=0;_t<K;_t++){let It=_t*D-Z;for(let wt=0;wt<rt;wt++){let Qt=wt*b-W;et[x]=Qt*w,et[g]=It*E,et[m]=J,h.push(et.x,et.y,et.z),et[x]=0,et[g]=0,et[m]=O>0?1:-1,l.push(et.x,et.y,et.z),u.push(wt/y),u.push(1-_t/R),ct+=1}}for(let _t=0;_t<R;_t++)for(let It=0;It<y;It++){let wt=d+It+rt*_t,Qt=d+It+rt*(_t+1),st=d+(It+1)+rt*(_t+1),ht=d+(It+1)+rt*_t;c.push(wt,Qt,ht),c.push(Qt,st,ht),tt+=6}a.addGroup(f,tt,A),f+=tt,d+=ct}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Rs(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function Je(i){let t={};for(let e=0;e<i.length;e++){let n=Rs(i[e]);for(let s in n)t[s]=n[s]}return t}function Fp(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Rd(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:oe.workingColorSpace}var Op={clone:Rs,merge:Je},kp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,zp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,_n=class extends Gi{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=kp,this.fragmentShader=zp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Rs(t.uniforms),this.uniformsGroups=Fp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}},ko=class extends ze{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Yt,this.projectionMatrix=new Yt,this.projectionMatrixInverse=new Yt,this.coordinateSystem=Qn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},xi=new I,yu=new yt,Mu=new yt,Be=class extends ko{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=As*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(cr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return As*2*Math.atan(Math.tan(cr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){xi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(xi.x,xi.y).multiplyScalar(-t/xi.z),xi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(xi.x,xi.y).multiplyScalar(-t/xi.z)}getViewSize(t,e){return this.getViewBounds(t,yu,Mu),e.subVectors(Mu,yu)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(cr*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,h=o.fullHeight;r+=o.offsetX*s/c,e-=o.offsetY*n/h,s*=o.width/c,n*=o.height/h}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},cs=-90,hs=1,fc=class extends ze{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Be(cs,hs,t,e);s.layers=this.layers,this.add(s);let r=new Be(cs,hs,t,e);r.layers=this.layers,this.add(r);let o=new Be(cs,hs,t,e);o.layers=this.layers,this.add(o);let a=new Be(cs,hs,t,e);a.layers=this.layers,this.add(a);let c=new Be(cs,hs,t,e);c.layers=this.layers,this.add(c);let h=new Be(cs,hs,t,e);h.layers=this.layers,this.add(h)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,c]=e;for(let h of e)this.remove(h);if(t===Qn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===Do)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let h of e)this.add(h),h.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,c,h,l]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),p=t.xr.enabled;t.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,o),t.setRenderTarget(n,2,s),t.render(e,a),t.setRenderTarget(n,3,s),t.render(e,c),t.setRenderTarget(n,4,s),t.render(e,h),n.texture.generateMipmaps=x,t.setRenderTarget(n,5,s),t.render(e,l),t.setRenderTarget(u,d,f),t.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},zo=class extends We{constructor(t,e,n,s,r,o,a,c,h,l){t=t!==void 0?t:[],e=e!==void 0?e:Ss,super(t,e,n,s,r,o,a,c,h,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},pc=class extends je{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new zo(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:Fn}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new en(5,5,5),r=new _n({name:"CubemapFromEquirect",uniforms:Rs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ge,blending:vi});r.uniforms.tEquirect.value=e;let o=new qt(s,r),a=e.minFilter;return e.minFilter===jn&&(e.minFilter=Fn),new fc(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,s){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}},ul=new I,Bp=new I,Hp=new ee,hn=class{constructor(t=new I(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=ul.subVectors(n,e).cross(Bp.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){let n=t.delta(ul),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Hp.getNormalMatrix(t),s=this.coplanarPoint(ul).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},Ni=new ii,po=new I,xr=class{constructor(t=new hn,e=new hn,n=new hn,s=new hn,r=new hn,o=new hn){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Qn){let n=this.planes,s=t.elements,r=s[0],o=s[1],a=s[2],c=s[3],h=s[4],l=s[5],u=s[6],d=s[7],f=s[8],p=s[9],x=s[10],g=s[11],m=s[12],w=s[13],E=s[14],S=s[15];if(n[0].setComponents(c-r,d-h,g-f,S-m).normalize(),n[1].setComponents(c+r,d+h,g+f,S+m).normalize(),n[2].setComponents(c+o,d+l,g+p,S+w).normalize(),n[3].setComponents(c-o,d-l,g-p,S-w).normalize(),n[4].setComponents(c-a,d-u,g-x,S-E).normalize(),e===Qn)n[5].setComponents(c+a,d+u,g+x,S+E).normalize();else if(e===Do)n[5].setComponents(a,u,x,E).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Ni.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Ni.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Ni)}intersectsSprite(t){return Ni.center.set(0,0,0),Ni.radius=.7071067811865476,Ni.applyMatrix4(t.matrixWorld),this.intersectsSphere(Ni)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(po.x=s.normal.x>0?t.max.x:t.min.x,po.y=s.normal.y>0?t.max.y:t.min.y,po.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(po)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Cd(){let i=null,t=!1,e=null,n=null;function s(r,o){e(r,o),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Vp(i){let t=new WeakMap;function e(a,c){let h=a.array,l=a.usage,u=h.byteLength,d=i.createBuffer();i.bindBuffer(c,d),i.bufferData(c,h,l),a.onUploadCallback();let f;if(h instanceof Float32Array)f=i.FLOAT;else if(h instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(h instanceof Int16Array)f=i.SHORT;else if(h instanceof Uint32Array)f=i.UNSIGNED_INT;else if(h instanceof Int32Array)f=i.INT;else if(h instanceof Int8Array)f=i.BYTE;else if(h instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:d,type:f,bytesPerElement:h.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,c,h){let l=c.array,u=c.updateRanges;if(i.bindBuffer(h,a),u.length===0)i.bufferSubData(h,0,l);else{u.sort((f,p)=>f.start-p.start);let d=0;for(let f=1;f<u.length;f++){let p=u[d],x=u[f];x.start<=p.start+p.count+1?p.count=Math.max(p.count,x.start+x.count-p.start):(++d,u[d]=x)}u.length=d+1;for(let f=0,p=u.length;f<p;f++){let x=u[f];i.bufferSubData(h,x.start*l.BYTES_PER_ELEMENT,l,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=t.get(a);c&&(i.deleteBuffer(c.buffer),t.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let l=t.get(a);(!l||l.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let h=t.get(a);if(h===void 0)t.set(a,e(a,c));else if(h.version<a.version){if(h.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(h.buffer,a,c),h.version=a.version}}return{get:s,remove:r,update:o}}var vn=class i extends Xe{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,o=e/2,a=Math.floor(n),c=Math.floor(s),h=a+1,l=c+1,u=t/a,d=e/c,f=[],p=[],x=[],g=[];for(let m=0;m<l;m++){let w=m*d-o;for(let E=0;E<h;E++){let S=E*u-r;p.push(S,-w,0),x.push(0,0,1),g.push(E/a),g.push(1-m/c)}}for(let m=0;m<c;m++)for(let w=0;w<a;w++){let E=w+h*m,S=w+h*(m+1),V=w+1+h*(m+1),O=w+1+h*m;f.push(E,S,O),f.push(S,V,O)}this.setIndex(f),this.setAttribute("position",new we(p,3)),this.setAttribute("normal",new we(x,3)),this.setAttribute("uv",new we(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}},Gp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Wp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Xp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,qp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Yp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Zp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,$p=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Jp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Kp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,jp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Qp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,t0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,e0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,n0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,i0=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,s0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,r0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,o0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,a0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,l0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,c0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,h0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,u0=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,d0=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,f0=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,p0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,m0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,g0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,x0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,_0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,v0="gl_FragColor = linearToOutputTexel( gl_FragColor );",y0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,M0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,b0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,S0=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,w0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,E0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,T0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,A0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,R0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,C0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,P0=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,I0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,D0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,L0=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,U0=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,N0=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,F0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,O0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,k0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,z0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,B0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,H0=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,V0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,G0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,W0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,X0=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,q0=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Y0=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Z0=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,$0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,J0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,K0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,j0=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Q0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,tm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,em=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,nm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,im=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,sm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,rm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,om=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,am=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,lm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,cm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,hm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,um=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,dm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,fm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,pm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,mm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,gm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,xm=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,_m=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,vm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,ym=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Mm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,bm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Sm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,wm=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Em=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Tm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Am=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Rm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Cm=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Pm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Im=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Dm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Lm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Um=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Nm=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Fm=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Om=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,km=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,zm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Bm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Hm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Vm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Gm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Wm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Xm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,qm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ym=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Zm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,$m=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Jm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Km=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,jm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Qm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,tg=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,eg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ng=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,ig=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sg=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,rg=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,og=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,ag=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,cg=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,hg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ug=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,dg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,fg=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,pg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,mg=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gg=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,xg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,_g=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,vg=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,yg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Mg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ne={alphahash_fragment:Gp,alphahash_pars_fragment:Wp,alphamap_fragment:Xp,alphamap_pars_fragment:qp,alphatest_fragment:Yp,alphatest_pars_fragment:Zp,aomap_fragment:$p,aomap_pars_fragment:Jp,batching_pars_vertex:Kp,batching_vertex:jp,begin_vertex:Qp,beginnormal_vertex:t0,bsdfs:e0,iridescence_fragment:n0,bumpmap_pars_fragment:i0,clipping_planes_fragment:s0,clipping_planes_pars_fragment:r0,clipping_planes_pars_vertex:o0,clipping_planes_vertex:a0,color_fragment:l0,color_pars_fragment:c0,color_pars_vertex:h0,color_vertex:u0,common:d0,cube_uv_reflection_fragment:f0,defaultnormal_vertex:p0,displacementmap_pars_vertex:m0,displacementmap_vertex:g0,emissivemap_fragment:x0,emissivemap_pars_fragment:_0,colorspace_fragment:v0,colorspace_pars_fragment:y0,envmap_fragment:M0,envmap_common_pars_fragment:b0,envmap_pars_fragment:S0,envmap_pars_vertex:w0,envmap_physical_pars_fragment:N0,envmap_vertex:E0,fog_vertex:T0,fog_pars_vertex:A0,fog_fragment:R0,fog_pars_fragment:C0,gradientmap_pars_fragment:P0,lightmap_pars_fragment:I0,lights_lambert_fragment:D0,lights_lambert_pars_fragment:L0,lights_pars_begin:U0,lights_toon_fragment:F0,lights_toon_pars_fragment:O0,lights_phong_fragment:k0,lights_phong_pars_fragment:z0,lights_physical_fragment:B0,lights_physical_pars_fragment:H0,lights_fragment_begin:V0,lights_fragment_maps:G0,lights_fragment_end:W0,logdepthbuf_fragment:X0,logdepthbuf_pars_fragment:q0,logdepthbuf_pars_vertex:Y0,logdepthbuf_vertex:Z0,map_fragment:$0,map_pars_fragment:J0,map_particle_fragment:K0,map_particle_pars_fragment:j0,metalnessmap_fragment:Q0,metalnessmap_pars_fragment:tm,morphinstance_vertex:em,morphcolor_vertex:nm,morphnormal_vertex:im,morphtarget_pars_vertex:sm,morphtarget_vertex:rm,normal_fragment_begin:om,normal_fragment_maps:am,normal_pars_fragment:lm,normal_pars_vertex:cm,normal_vertex:hm,normalmap_pars_fragment:um,clearcoat_normal_fragment_begin:dm,clearcoat_normal_fragment_maps:fm,clearcoat_pars_fragment:pm,iridescence_pars_fragment:mm,opaque_fragment:gm,packing:xm,premultiplied_alpha_fragment:_m,project_vertex:vm,dithering_fragment:ym,dithering_pars_fragment:Mm,roughnessmap_fragment:bm,roughnessmap_pars_fragment:Sm,shadowmap_pars_fragment:wm,shadowmap_pars_vertex:Em,shadowmap_vertex:Tm,shadowmask_pars_fragment:Am,skinbase_vertex:Rm,skinning_pars_vertex:Cm,skinning_vertex:Pm,skinnormal_vertex:Im,specularmap_fragment:Dm,specularmap_pars_fragment:Lm,tonemapping_fragment:Um,tonemapping_pars_fragment:Nm,transmission_fragment:Fm,transmission_pars_fragment:Om,uv_pars_fragment:km,uv_pars_vertex:zm,uv_vertex:Bm,worldpos_vertex:Hm,background_vert:Vm,background_frag:Gm,backgroundCube_vert:Wm,backgroundCube_frag:Xm,cube_vert:qm,cube_frag:Ym,depth_vert:Zm,depth_frag:$m,distanceRGBA_vert:Jm,distanceRGBA_frag:Km,equirect_vert:jm,equirect_frag:Qm,linedashed_vert:tg,linedashed_frag:eg,meshbasic_vert:ng,meshbasic_frag:ig,meshlambert_vert:sg,meshlambert_frag:rg,meshmatcap_vert:og,meshmatcap_frag:ag,meshnormal_vert:lg,meshnormal_frag:cg,meshphong_vert:hg,meshphong_frag:ug,meshphysical_vert:dg,meshphysical_frag:fg,meshtoon_vert:pg,meshtoon_frag:mg,points_vert:gg,points_frag:xg,shadow_vert:_g,shadow_frag:vg,sprite_vert:yg,sprite_frag:Mg},bt={common:{diffuse:{value:new Wt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ee},alphaMap:{value:null},alphaMapTransform:{value:new ee},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ee}},envmap:{envMap:{value:null},envMapRotation:{value:new ee},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ee}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ee}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ee},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ee},normalScale:{value:new yt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ee},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ee}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ee}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ee}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Wt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Wt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ee},alphaTest:{value:0},uvTransform:{value:new ee}},sprite:{diffuse:{value:new Wt(16777215)},opacity:{value:1},center:{value:new yt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ee},alphaMap:{value:null},alphaMapTransform:{value:new ee},alphaTest:{value:0}}},Un={basic:{uniforms:Je([bt.common,bt.specularmap,bt.envmap,bt.aomap,bt.lightmap,bt.fog]),vertexShader:ne.meshbasic_vert,fragmentShader:ne.meshbasic_frag},lambert:{uniforms:Je([bt.common,bt.specularmap,bt.envmap,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.fog,bt.lights,{emissive:{value:new Wt(0)}}]),vertexShader:ne.meshlambert_vert,fragmentShader:ne.meshlambert_frag},phong:{uniforms:Je([bt.common,bt.specularmap,bt.envmap,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.fog,bt.lights,{emissive:{value:new Wt(0)},specular:{value:new Wt(1118481)},shininess:{value:30}}]),vertexShader:ne.meshphong_vert,fragmentShader:ne.meshphong_frag},standard:{uniforms:Je([bt.common,bt.envmap,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.roughnessmap,bt.metalnessmap,bt.fog,bt.lights,{emissive:{value:new Wt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ne.meshphysical_vert,fragmentShader:ne.meshphysical_frag},toon:{uniforms:Je([bt.common,bt.aomap,bt.lightmap,bt.emissivemap,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.gradientmap,bt.fog,bt.lights,{emissive:{value:new Wt(0)}}]),vertexShader:ne.meshtoon_vert,fragmentShader:ne.meshtoon_frag},matcap:{uniforms:Je([bt.common,bt.bumpmap,bt.normalmap,bt.displacementmap,bt.fog,{matcap:{value:null}}]),vertexShader:ne.meshmatcap_vert,fragmentShader:ne.meshmatcap_frag},points:{uniforms:Je([bt.points,bt.fog]),vertexShader:ne.points_vert,fragmentShader:ne.points_frag},dashed:{uniforms:Je([bt.common,bt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ne.linedashed_vert,fragmentShader:ne.linedashed_frag},depth:{uniforms:Je([bt.common,bt.displacementmap]),vertexShader:ne.depth_vert,fragmentShader:ne.depth_frag},normal:{uniforms:Je([bt.common,bt.bumpmap,bt.normalmap,bt.displacementmap,{opacity:{value:1}}]),vertexShader:ne.meshnormal_vert,fragmentShader:ne.meshnormal_frag},sprite:{uniforms:Je([bt.sprite,bt.fog]),vertexShader:ne.sprite_vert,fragmentShader:ne.sprite_frag},background:{uniforms:{uvTransform:{value:new ee},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ne.background_vert,fragmentShader:ne.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ee}},vertexShader:ne.backgroundCube_vert,fragmentShader:ne.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ne.cube_vert,fragmentShader:ne.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ne.equirect_vert,fragmentShader:ne.equirect_frag},distanceRGBA:{uniforms:Je([bt.common,bt.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ne.distanceRGBA_vert,fragmentShader:ne.distanceRGBA_frag},shadow:{uniforms:Je([bt.lights,bt.fog,{color:{value:new Wt(0)},opacity:{value:1}}]),vertexShader:ne.shadow_vert,fragmentShader:ne.shadow_frag}};Un.physical={uniforms:Je([Un.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ee},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ee},clearcoatNormalScale:{value:new yt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ee},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ee},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ee},sheen:{value:0},sheenColor:{value:new Wt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ee},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ee},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ee},transmissionSamplerSize:{value:new yt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ee},attenuationDistance:{value:0},attenuationColor:{value:new Wt(0)},specularColor:{value:new Wt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ee},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ee},anisotropyVector:{value:new yt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ee}}]),vertexShader:ne.meshphysical_vert,fragmentShader:ne.meshphysical_frag};var mo={r:0,b:0,g:0},Fi=new zn,bg=new Yt;function Sg(i,t,e,n,s,r,o){let a=new Wt(0),c=r===!0?0:1,h,l,u=null,d=0,f=null;function p(w){let E=w.isScene===!0?w.background:null;return E&&E.isTexture&&(E=(w.backgroundBlurriness>0?e:t).get(E)),E}function x(w){let E=!1,S=p(w);S===null?m(a,c):S&&S.isColor&&(m(S,1),E=!0);let V=i.xr.getEnvironmentBlendMode();V==="additive"?n.buffers.color.setClear(0,0,0,1,o):V==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||E)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function g(w,E){let S=p(E);S&&(S.isCubeTexture||S.mapping===aa)?(l===void 0&&(l=new qt(new en(1,1,1),new _n({name:"BackgroundCubeMaterial",uniforms:Rs(Un.backgroundCube.uniforms),vertexShader:Un.backgroundCube.vertexShader,fragmentShader:Un.backgroundCube.fragmentShader,side:Ge,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(V,O,y){this.matrixWorld.copyPosition(y.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(l)),Fi.copy(E.backgroundRotation),Fi.x*=-1,Fi.y*=-1,Fi.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(Fi.y*=-1,Fi.z*=-1),l.material.uniforms.envMap.value=S,l.material.uniforms.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,l.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(bg.makeRotationFromEuler(Fi)),l.material.toneMapped=oe.getTransfer(S.colorSpace)!==_e,(u!==S||d!==S.version||f!==i.toneMapping)&&(l.material.needsUpdate=!0,u=S,d=S.version,f=i.toneMapping),l.layers.enableAll(),w.unshift(l,l.geometry,l.material,0,0,null)):S&&S.isTexture&&(h===void 0&&(h=new qt(new vn(2,2),new _n({name:"BackgroundMaterial",uniforms:Rs(Un.background.uniforms),vertexShader:Un.background.vertexShader,fragmentShader:Un.background.fragmentShader,side:Mi,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),Object.defineProperty(h.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(h)),h.material.uniforms.t2D.value=S,h.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,h.material.toneMapped=oe.getTransfer(S.colorSpace)!==_e,S.matrixAutoUpdate===!0&&S.updateMatrix(),h.material.uniforms.uvTransform.value.copy(S.matrix),(u!==S||d!==S.version||f!==i.toneMapping)&&(h.material.needsUpdate=!0,u=S,d=S.version,f=i.toneMapping),h.layers.enableAll(),w.unshift(h,h.geometry,h.material,0,0,null))}function m(w,E){w.getRGB(mo,Rd(i)),n.buffers.color.setClear(mo.r,mo.g,mo.b,E,o)}return{getClearColor:function(){return a},setClearColor:function(w,E=1){a.set(w),c=E,m(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(w){c=w,m(a,c)},render:x,addToRenderList:g}}function wg(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,o=!1;function a(b,D,W,Z,J){let rt=!1,K=u(Z,W,D);r!==K&&(r=K,h(r.object)),rt=f(b,Z,W,J),rt&&p(b,Z,W,J),J!==null&&t.update(J,i.ELEMENT_ARRAY_BUFFER),(rt||o)&&(o=!1,S(b,D,W,Z),J!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(J).buffer))}function c(){return i.createVertexArray()}function h(b){return i.bindVertexArray(b)}function l(b){return i.deleteVertexArray(b)}function u(b,D,W){let Z=W.wireframe===!0,J=n[b.id];J===void 0&&(J={},n[b.id]=J);let rt=J[D.id];rt===void 0&&(rt={},J[D.id]=rt);let K=rt[Z];return K===void 0&&(K=d(c()),rt[Z]=K),K}function d(b){let D=[],W=[],Z=[];for(let J=0;J<e;J++)D[J]=0,W[J]=0,Z[J]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:D,enabledAttributes:W,attributeDivisors:Z,object:b,attributes:{},index:null}}function f(b,D,W,Z){let J=r.attributes,rt=D.attributes,K=0,ct=W.getAttributes();for(let tt in ct)if(ct[tt].location>=0){let _t=J[tt],It=rt[tt];if(It===void 0&&(tt==="instanceMatrix"&&b.instanceMatrix&&(It=b.instanceMatrix),tt==="instanceColor"&&b.instanceColor&&(It=b.instanceColor)),_t===void 0||_t.attribute!==It||It&&_t.data!==It.data)return!0;K++}return r.attributesNum!==K||r.index!==Z}function p(b,D,W,Z){let J={},rt=D.attributes,K=0,ct=W.getAttributes();for(let tt in ct)if(ct[tt].location>=0){let _t=rt[tt];_t===void 0&&(tt==="instanceMatrix"&&b.instanceMatrix&&(_t=b.instanceMatrix),tt==="instanceColor"&&b.instanceColor&&(_t=b.instanceColor));let It={};It.attribute=_t,_t&&_t.data&&(It.data=_t.data),J[tt]=It,K++}r.attributes=J,r.attributesNum=K,r.index=Z}function x(){let b=r.newAttributes;for(let D=0,W=b.length;D<W;D++)b[D]=0}function g(b){m(b,0)}function m(b,D){let W=r.newAttributes,Z=r.enabledAttributes,J=r.attributeDivisors;W[b]=1,Z[b]===0&&(i.enableVertexAttribArray(b),Z[b]=1),J[b]!==D&&(i.vertexAttribDivisor(b,D),J[b]=D)}function w(){let b=r.newAttributes,D=r.enabledAttributes;for(let W=0,Z=D.length;W<Z;W++)D[W]!==b[W]&&(i.disableVertexAttribArray(W),D[W]=0)}function E(b,D,W,Z,J,rt,K){K===!0?i.vertexAttribIPointer(b,D,W,J,rt):i.vertexAttribPointer(b,D,W,Z,J,rt)}function S(b,D,W,Z){x();let J=Z.attributes,rt=W.getAttributes(),K=D.defaultAttributeValues;for(let ct in rt){let tt=rt[ct];if(tt.location>=0){let et=J[ct];if(et===void 0&&(ct==="instanceMatrix"&&b.instanceMatrix&&(et=b.instanceMatrix),ct==="instanceColor"&&b.instanceColor&&(et=b.instanceColor)),et!==void 0){let _t=et.normalized,It=et.itemSize,wt=t.get(et);if(wt===void 0)continue;let Qt=wt.buffer,st=wt.type,ht=wt.bytesPerElement,Et=st===i.INT||st===i.UNSIGNED_INT||et.gpuType===Zc;if(et.isInterleavedBufferAttribute){let mt=et.data,Vt=mt.stride,Gt=et.offset;if(mt.isInstancedInterleavedBuffer){for(let Zt=0;Zt<tt.locationSize;Zt++)m(tt.location+Zt,mt.meshPerAttribute);b.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=mt.meshPerAttribute*mt.count)}else for(let Zt=0;Zt<tt.locationSize;Zt++)g(tt.location+Zt);i.bindBuffer(i.ARRAY_BUFFER,Qt);for(let Zt=0;Zt<tt.locationSize;Zt++)E(tt.location+Zt,It/tt.locationSize,st,_t,Vt*ht,(Gt+It/tt.locationSize*Zt)*ht,Et)}else{if(et.isInstancedBufferAttribute){for(let mt=0;mt<tt.locationSize;mt++)m(tt.location+mt,et.meshPerAttribute);b.isInstancedMesh!==!0&&Z._maxInstanceCount===void 0&&(Z._maxInstanceCount=et.meshPerAttribute*et.count)}else for(let mt=0;mt<tt.locationSize;mt++)g(tt.location+mt);i.bindBuffer(i.ARRAY_BUFFER,Qt);for(let mt=0;mt<tt.locationSize;mt++)E(tt.location+mt,It/tt.locationSize,st,_t,It*ht,It/tt.locationSize*mt*ht,Et)}}else if(K!==void 0){let _t=K[ct];if(_t!==void 0)switch(_t.length){case 2:i.vertexAttrib2fv(tt.location,_t);break;case 3:i.vertexAttrib3fv(tt.location,_t);break;case 4:i.vertexAttrib4fv(tt.location,_t);break;default:i.vertexAttrib1fv(tt.location,_t)}}}}w()}function V(){R();for(let b in n){let D=n[b];for(let W in D){let Z=D[W];for(let J in Z)l(Z[J].object),delete Z[J];delete D[W]}delete n[b]}}function O(b){if(n[b.id]===void 0)return;let D=n[b.id];for(let W in D){let Z=D[W];for(let J in Z)l(Z[J].object),delete Z[J];delete D[W]}delete n[b.id]}function y(b){for(let D in n){let W=n[D];if(W[b.id]===void 0)continue;let Z=W[b.id];for(let J in Z)l(Z[J].object),delete Z[J];delete W[b.id]}}function R(){A(),o=!0,r!==s&&(r=s,h(r.object))}function A(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:R,resetDefaultState:A,dispose:V,releaseStatesOfGeometry:O,releaseStatesOfProgram:y,initAttributes:x,enableAttribute:g,disableUnusedAttributes:w}}function Eg(i,t,e){let n;function s(h){n=h}function r(h,l){i.drawArrays(n,h,l),e.update(l,n,1)}function o(h,l,u){u!==0&&(i.drawArraysInstanced(n,h,l,u),e.update(l,n,u))}function a(h,l,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,h,0,l,0,u);let f=0;for(let p=0;p<u;p++)f+=l[p];e.update(f,n,1)}function c(h,l,u,d){if(u===0)return;let f=t.get("WEBGL_multi_draw");if(f===null)for(let p=0;p<h.length;p++)o(h[p],l[p],d[p]);else{f.multiDrawArraysInstancedWEBGL(n,h,0,l,0,d,0,u);let p=0;for(let x=0;x<u;x++)p+=l[x]*d[x];e.update(p,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function Tg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let y=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(y.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(y){return!(y!==gn&&n.convert(y)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(y){let R=y===oi&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(y!==ei&&n.convert(y)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&y!==Cn&&!R)}function c(y){if(y==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";y="mediump"}return y==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let h=e.precision!==void 0?e.precision:"highp",l=c(h);l!==h&&(console.warn("THREE.WebGLRenderer:",h,"not supported, using",l,"instead."),h=l);let u=e.logarithmicDepthBuffer===!0,d=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),w=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),E=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),V=p>0,O=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:h,logarithmicDepthBuffer:u,reverseDepthBuffer:d,maxTextures:f,maxVertexTextures:p,maxTextureSize:x,maxCubemapSize:g,maxAttributes:m,maxVertexUniforms:w,maxVaryings:E,maxFragmentUniforms:S,vertexTextures:V,maxSamples:O}}function Ag(i){let t=this,e=null,n=0,s=!1,r=!1,o=new hn,a=new ee,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||n!==0||s;return s=d,n=u.length,f},this.beginShadows=function(){r=!0,l(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=l(u,d,0)},this.setState=function(u,d,f){let p=u.clippingPlanes,x=u.clipIntersection,g=u.clipShadows,m=i.get(u);if(!s||p===null||p.length===0||r&&!g)r?l(null):h();else{let w=r?0:n,E=w*4,S=m.clippingState||null;c.value=S,S=l(p,d,E,f);for(let V=0;V!==E;++V)S[V]=e[V];m.clippingState=S,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=w}};function h(){c.value!==e&&(c.value=e,c.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function l(u,d,f,p){let x=u!==null?u.length:0,g=null;if(x!==0){if(g=c.value,p!==!0||g===null){let m=f+x*4,w=d.matrixWorldInverse;a.getNormalMatrix(w),(g===null||g.length<m)&&(g=new Float32Array(m));for(let E=0,S=f;E!==x;++E,S+=4)o.copy(u[E]).applyMatrix4(w,a),o.normal.toArray(g,S),g[S+3]=o.constant}c.value=g,c.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,g}}function Rg(i){let t=new WeakMap;function e(o,a){return a===Ul?o.mapping=Ss:a===Nl&&(o.mapping=ws),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===Ul||a===Nl)if(t.has(o)){let c=t.get(o).texture;return e(c,o.mapping)}else{let c=o.image;if(c&&c.height>0){let h=new pc(c.height);return h.fromEquirectangularTexture(i,o),t.set(o,h),o.addEventListener("dispose",s),e(h.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let c=t.get(a);c!==void 0&&(t.delete(a),c.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}var Cs=class extends ko{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,o=n+t,a=s+e,c=s-e;if(this.view!==null&&this.view.enabled){let h=(this.right-this.left)/this.view.fullWidth/this.zoom,l=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=h*this.view.offsetX,o=r+h*this.view.width,a-=l*this.view.offsetY,c=a-l*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},gs=4,bu=[.125,.215,.35,.446,.526,.582],Hi=20,dl=new Cs,Su=new Wt,fl=null,pl=0,ml=0,gl=!1,ki=(1+Math.sqrt(5))/2,us=1/ki,wu=[new I(-ki,us,0),new I(ki,us,0),new I(-us,0,ki),new I(us,0,ki),new I(0,ki,-us),new I(0,ki,us),new I(-1,1,-1),new I(1,1,-1),new I(-1,1,1),new I(1,1,1)],Ps=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100){fl=this._renderer.getRenderTarget(),pl=this._renderer.getActiveCubeFace(),ml=this._renderer.getActiveMipmapLevel(),gl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Au(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Tu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(fl,pl,ml),this._renderer.xr.enabled=gl,t.scissorTest=!1,go(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ss||t.mapping===ws?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),fl=this._renderer.getRenderTarget(),pl=this._renderer.getActiveCubeFace(),ml=this._renderer.getActiveMipmapLevel(),gl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Fn,minFilter:Fn,generateMipmaps:!1,type:oi,format:gn,colorSpace:zs,depthBuffer:!1},s=Eu(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Eu(t,e,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Cg(r)),this._blurMaterial=Pg(r,t,e)}return s}_compileMaterial(t){let e=new qt(this._lodPlanes[0],t);this._renderer.compile(e,dl)}_sceneToCubeUV(t,e,n,s){let a=new Be(90,1,e,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],l=this._renderer,u=l.autoClear,d=l.toneMapping;l.getClearColor(Su),l.toneMapping=yi,l.autoClear=!1;let f=new Ee({name:"PMREM.Background",side:Ge,depthWrite:!1,depthTest:!1}),p=new qt(new en,f),x=!1,g=t.background;g?g.isColor&&(f.color.copy(g),t.background=null,x=!0):(f.color.copy(Su),x=!0);for(let m=0;m<6;m++){let w=m%3;w===0?(a.up.set(0,c[m],0),a.lookAt(h[m],0,0)):w===1?(a.up.set(0,0,c[m]),a.lookAt(0,h[m],0)):(a.up.set(0,c[m],0),a.lookAt(0,0,h[m]));let E=this._cubeSize;go(s,w*E,m>2?E:0,E,E),l.setRenderTarget(s),x&&l.render(p,a),l.render(t,a)}p.geometry.dispose(),p.material.dispose(),l.toneMapping=d,l.autoClear=u,t.background=g}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Ss||t.mapping===ws;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Au()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Tu());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new qt(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;let c=this._cubeSize;go(e,0,0,3*c,2*c),n.setRenderTarget(e),n.render(o,dl)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=wu[(s-r-1)%wu.length];this._blur(t,r-1,r,o,a)}e.autoClear=n}_blur(t,e,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,s,"latitudinal",r),this._halfBlur(o,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,o,a){let c=this._renderer,h=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let l=3,u=new qt(this._lodPlanes[s],h),d=h.uniforms,f=this._sizeLods[n]-1,p=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Hi-1),x=r/p,g=isFinite(r)?1+Math.floor(l*x):Hi;g>Hi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${Hi}`);let m=[],w=0;for(let y=0;y<Hi;++y){let R=y/x,A=Math.exp(-R*R/2);m.push(A),y===0?w+=A:y<g&&(w+=2*A)}for(let y=0;y<m.length;y++)m[y]=m[y]/w;d.envMap.value=t.texture,d.samples.value=g,d.weights.value=m,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);let{_lodMax:E}=this;d.dTheta.value=p,d.mipInt.value=E-n;let S=this._sizeLods[s],V=3*S*(s>E-gs?s-E+gs:0),O=4*(this._cubeSize-S);go(e,V,O,3*S,2*S),c.setRenderTarget(e),c.render(u,dl)}};function Cg(i){let t=[],e=[],n=[],s=i,r=i-gs+1+bu.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);e.push(a);let c=1/a;o>i-gs?c=bu[o-i+gs-1]:o===0&&(c=0),n.push(c);let h=1/(a-2),l=-h,u=1+h,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=6,p=6,x=3,g=2,m=1,w=new Float32Array(x*p*f),E=new Float32Array(g*p*f),S=new Float32Array(m*p*f);for(let O=0;O<f;O++){let y=O%3*2/3-1,R=O>2?0:-1,A=[y,R,0,y+2/3,R,0,y+2/3,R+1,0,y,R,0,y+2/3,R+1,0,y,R+1,0];w.set(A,x*p*O),E.set(d,g*p*O);let b=[O,O,O,O,O,O];S.set(b,m*p*O)}let V=new Xe;V.setAttribute("position",new Te(w,x)),V.setAttribute("uv",new Te(E,g)),V.setAttribute("faceIndex",new Te(S,m)),t.push(V),s>gs&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Eu(i,t,e){let n=new je(i,t,e);return n.texture.mapping=aa,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function go(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Pg(i,t,e){let n=new Float32Array(Hi),s=new I(0,1,0);return new _n({name:"SphericalGaussianBlur",defines:{n:Hi,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:sh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:vi,depthTest:!1,depthWrite:!1})}function Tu(){return new _n({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:sh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:vi,depthTest:!1,depthWrite:!1})}function Au(){return new _n({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:sh(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:vi,depthTest:!1,depthWrite:!1})}function sh(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Ig(i){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){let c=a.mapping,h=c===Ul||c===Nl,l=c===Ss||c===ws;if(h||l){let u=t.get(a),d=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return e===null&&(e=new Ps(i)),u=h?e.fromEquirectangular(a,u):e.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),u.texture;if(u!==void 0)return u.texture;{let f=a.image;return h&&f&&f.height>0||l&&f&&s(f)?(e===null&&(e=new Ps(i)),u=h?e.fromEquirectangular(a):e.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let c=0,h=6;for(let l=0;l<h;l++)a[l]!==void 0&&c++;return c===h}function r(a){let c=a.target;c.removeEventListener("dispose",r);let h=t.get(c);h!==void 0&&(t.delete(c),h.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function Dg(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&ar("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Lg(i,t,e,n){let s={},r=new WeakMap;function o(u){let d=u.target;d.index!==null&&t.remove(d.index);for(let p in d.attributes)t.remove(d.attributes[p]);for(let p in d.morphAttributes){let x=d.morphAttributes[p];for(let g=0,m=x.length;g<m;g++)t.remove(x[g])}d.removeEventListener("dispose",o),delete s[d.id];let f=r.get(d);f&&(t.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(u,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,e.memory.geometries++),d}function c(u){let d=u.attributes;for(let p in d)t.update(d[p],i.ARRAY_BUFFER);let f=u.morphAttributes;for(let p in f){let x=f[p];for(let g=0,m=x.length;g<m;g++)t.update(x[g],i.ARRAY_BUFFER)}}function h(u){let d=[],f=u.index,p=u.attributes.position,x=0;if(f!==null){let w=f.array;x=f.version;for(let E=0,S=w.length;E<S;E+=3){let V=w[E+0],O=w[E+1],y=w[E+2];d.push(V,O,O,y,y,V)}}else if(p!==void 0){let w=p.array;x=p.version;for(let E=0,S=w.length/3-1;E<S;E+=3){let V=E+0,O=E+1,y=E+2;d.push(V,O,O,y,y,V)}}else return;let g=new(Td(d)?Oo:Fo)(d,1);g.version=x;let m=r.get(u);m&&t.remove(m),r.set(u,g)}function l(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&h(u)}else h(u);return r.get(u)}return{get:a,update:c,getWireframeAttribute:l}}function Ug(i,t,e){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function c(d,f){i.drawElements(n,f,r,d*o),e.update(f,n,1)}function h(d,f,p){p!==0&&(i.drawElementsInstanced(n,f,r,d*o,p),e.update(f,n,p))}function l(d,f,p){if(p===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,p);let g=0;for(let m=0;m<p;m++)g+=f[m];e.update(g,n,1)}function u(d,f,p,x){if(p===0)return;let g=t.get("WEBGL_multi_draw");if(g===null)for(let m=0;m<d.length;m++)h(d[m]/o,f[m],x[m]);else{g.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,x,0,p);let m=0;for(let w=0;w<p;w++)m+=f[w]*x[w];e.update(m,n,1)}}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=h,this.renderMultiDraw=l,this.renderMultiDrawInstances=u}function Ng(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Fg(i,t,e){let n=new WeakMap,s=new ce;function r(o,a,c){let h=o.morphTargetInfluences,l=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=l!==void 0?l.length:0,d=n.get(a);if(d===void 0||d.count!==u){let A=function(){y.dispose(),n.delete(a),a.removeEventListener("dispose",A)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,p=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],w=a.morphAttributes.color||[],E=0;f===!0&&(E=1),p===!0&&(E=2),x===!0&&(E=3);let S=a.attributes.position.count*E,V=1;S>t.maxTextureSize&&(V=Math.ceil(S/t.maxTextureSize),S=t.maxTextureSize);let O=new Float32Array(S*V*4*u),y=new No(O,S,V,u);y.type=Cn,y.needsUpdate=!0;let R=E*4;for(let b=0;b<u;b++){let D=g[b],W=m[b],Z=w[b],J=S*V*4*b;for(let rt=0;rt<D.count;rt++){let K=rt*R;f===!0&&(s.fromBufferAttribute(D,rt),O[J+K+0]=s.x,O[J+K+1]=s.y,O[J+K+2]=s.z,O[J+K+3]=0),p===!0&&(s.fromBufferAttribute(W,rt),O[J+K+4]=s.x,O[J+K+5]=s.y,O[J+K+6]=s.z,O[J+K+7]=0),x===!0&&(s.fromBufferAttribute(Z,rt),O[J+K+8]=s.x,O[J+K+9]=s.y,O[J+K+10]=s.z,O[J+K+11]=Z.itemSize===4?s.w:1)}}d={count:u,texture:y,size:new yt(S,V)},n.set(a,d),a.addEventListener("dispose",A)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let f=0;for(let x=0;x<h.length;x++)f+=h[x];let p=a.morphTargetsRelative?1:1-f;c.getUniforms().setValue(i,"morphTargetBaseInfluence",p),c.getUniforms().setValue(i,"morphTargetInfluences",h)}c.getUniforms().setValue(i,"morphTargetsTexture",d.texture,e),c.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function Og(i,t,e,n){let s=new WeakMap;function r(c){let h=n.render.frame,l=c.geometry,u=t.get(c,l);if(s.get(u)!==h&&(t.update(u),s.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),s.get(c)!==h&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),s.set(c,h))),c.isSkinnedMesh){let d=c.skeleton;s.get(d)!==h&&(d.update(),s.set(d,h))}return u}function o(){s=new WeakMap}function a(c){let h=c.target;h.removeEventListener("dispose",a),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:r,dispose:o}}var Is=class extends We{constructor(t,e,n,s,r,o,a,c,h,l=vs){if(l!==vs&&l!==Ts)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&l===vs&&(n=ni),n===void 0&&l===Ts&&(n=Es),super(null,s,r,o,a,c,l,n,h),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:Ke,this.minFilter=c!==void 0?c:Ke,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},Pd=new We,Ru=new Is(1,1),Id=new No,Dd=new dc,Ld=new zo,Cu=[],Pu=[],Iu=new Float32Array(16),Du=new Float32Array(9),Lu=new Float32Array(4);function Bs(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=Cu[s];if(r===void 0&&(r=new Float32Array(s),Cu[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function Le(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Ue(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function ha(i,t){let e=Pu[t];e===void 0&&(e=new Int32Array(t),Pu[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function kg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function zg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Le(e,t))return;i.uniform2fv(this.addr,t),Ue(e,t)}}function Bg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Le(e,t))return;i.uniform3fv(this.addr,t),Ue(e,t)}}function Hg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Le(e,t))return;i.uniform4fv(this.addr,t),Ue(e,t)}}function Vg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Le(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Ue(e,t)}else{if(Le(e,n))return;Lu.set(n),i.uniformMatrix2fv(this.addr,!1,Lu),Ue(e,n)}}function Gg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Le(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Ue(e,t)}else{if(Le(e,n))return;Du.set(n),i.uniformMatrix3fv(this.addr,!1,Du),Ue(e,n)}}function Wg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Le(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Ue(e,t)}else{if(Le(e,n))return;Iu.set(n),i.uniformMatrix4fv(this.addr,!1,Iu),Ue(e,n)}}function Xg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function qg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Le(e,t))return;i.uniform2iv(this.addr,t),Ue(e,t)}}function Yg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Le(e,t))return;i.uniform3iv(this.addr,t),Ue(e,t)}}function Zg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Le(e,t))return;i.uniform4iv(this.addr,t),Ue(e,t)}}function $g(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Jg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Le(e,t))return;i.uniform2uiv(this.addr,t),Ue(e,t)}}function Kg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Le(e,t))return;i.uniform3uiv(this.addr,t),Ue(e,t)}}function jg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Le(e,t))return;i.uniform4uiv(this.addr,t),Ue(e,t)}}function Qg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Ru.compareFunction=Ed,r=Ru):r=Pd,e.setTexture2D(t||r,s)}function tx(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Dd,s)}function ex(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Ld,s)}function nx(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Id,s)}function ix(i){switch(i){case 5126:return kg;case 35664:return zg;case 35665:return Bg;case 35666:return Hg;case 35674:return Vg;case 35675:return Gg;case 35676:return Wg;case 5124:case 35670:return Xg;case 35667:case 35671:return qg;case 35668:case 35672:return Yg;case 35669:case 35673:return Zg;case 5125:return $g;case 36294:return Jg;case 36295:return Kg;case 36296:return jg;case 35678:case 36198:case 36298:case 36306:case 35682:return Qg;case 35679:case 36299:case 36307:return tx;case 35680:case 36300:case 36308:case 36293:return ex;case 36289:case 36303:case 36311:case 36292:return nx}}function sx(i,t){i.uniform1fv(this.addr,t)}function rx(i,t){let e=Bs(t,this.size,2);i.uniform2fv(this.addr,e)}function ox(i,t){let e=Bs(t,this.size,3);i.uniform3fv(this.addr,e)}function ax(i,t){let e=Bs(t,this.size,4);i.uniform4fv(this.addr,e)}function lx(i,t){let e=Bs(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function cx(i,t){let e=Bs(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function hx(i,t){let e=Bs(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function ux(i,t){i.uniform1iv(this.addr,t)}function dx(i,t){i.uniform2iv(this.addr,t)}function fx(i,t){i.uniform3iv(this.addr,t)}function px(i,t){i.uniform4iv(this.addr,t)}function mx(i,t){i.uniform1uiv(this.addr,t)}function gx(i,t){i.uniform2uiv(this.addr,t)}function xx(i,t){i.uniform3uiv(this.addr,t)}function _x(i,t){i.uniform4uiv(this.addr,t)}function vx(i,t,e){let n=this.cache,s=t.length,r=ha(e,s);Le(n,r)||(i.uniform1iv(this.addr,r),Ue(n,r));for(let o=0;o!==s;++o)e.setTexture2D(t[o]||Pd,r[o])}function yx(i,t,e){let n=this.cache,s=t.length,r=ha(e,s);Le(n,r)||(i.uniform1iv(this.addr,r),Ue(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||Dd,r[o])}function Mx(i,t,e){let n=this.cache,s=t.length,r=ha(e,s);Le(n,r)||(i.uniform1iv(this.addr,r),Ue(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||Ld,r[o])}function bx(i,t,e){let n=this.cache,s=t.length,r=ha(e,s);Le(n,r)||(i.uniform1iv(this.addr,r),Ue(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||Id,r[o])}function Sx(i){switch(i){case 5126:return sx;case 35664:return rx;case 35665:return ox;case 35666:return ax;case 35674:return lx;case 35675:return cx;case 35676:return hx;case 5124:case 35670:return ux;case 35667:case 35671:return dx;case 35668:case 35672:return fx;case 35669:case 35673:return px;case 5125:return mx;case 36294:return gx;case 36295:return xx;case 36296:return _x;case 35678:case 36198:case 36298:case 36306:case 35682:return vx;case 35679:case 36299:case 36307:return yx;case 35680:case 36300:case 36308:case 36293:return Mx;case 36289:case 36303:case 36311:case 36292:return bx}}var mc=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=ix(e.type)}},gc=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Sx(e.type)}},xc=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(t,e[a.id],n)}}},xl=/(\w+)(\])?(\[|\.)?/g;function Uu(i,t){i.seq.push(t),i.map[t.id]=t}function wx(i,t,e){let n=i.name,s=n.length;for(xl.lastIndex=0;;){let r=xl.exec(n),o=xl.lastIndex,a=r[1],c=r[2]==="]",h=r[3];if(c&&(a=a|0),h===void 0||h==="["&&o+2===s){Uu(e,h===void 0?new mc(a,i,t):new gc(a,i,t));break}else{let u=e.map[a];u===void 0&&(u=new xc(a),Uu(e,u)),e=u}}}var Ms=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=t.getActiveUniform(e,s),o=t.getUniformLocation(e,r.name);wx(r,o,this)}}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){let a=e[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(t,c.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let o=t[s];o.id in e&&n.push(o)}return n}};function Nu(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var Ex=37297,Tx=0;function Ax(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}var Fu=new ee;function Rx(i){oe._getMatrix(Fu,oe.workingColorSpace,i);let t=`mat3( ${Fu.elements.map(e=>e.toFixed(4))} )`;switch(oe.getTransfer(i)){case ca:return[t,"LinearTransferOETF"];case _e:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function Ou(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let o=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+Ax(i.getShaderSource(t),o)}else return s}function Cx(i,t){let e=Rx(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function Px(i,t){let e;switch(t){case kf:e="Linear";break;case zf:e="Reinhard";break;case Bf:e="Cineon";break;case Yc:e="ACESFilmic";break;case Vf:e="AgX";break;case Gf:e="Neutral";break;case Hf:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var xo=new I;function Ix(){oe.getLuminanceCoefficients(xo);let i=xo.x.toFixed(4),t=xo.y.toFixed(4),e=xo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Dx(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(lr).join(`
`)}function Lx(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Ux(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function lr(i){return i!==""}function ku(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function zu(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Nx=/^[ \t]*#include +<([\w\d./]+)>/gm;function _c(i){return i.replace(Nx,Ox)}var Fx=new Map;function Ox(i,t){let e=ne[t];if(e===void 0){let n=Fx.get(t);if(n!==void 0)e=ne[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return _c(e)}var kx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Bu(i){return i.replace(kx,zx)}function zx(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Hu(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function Bx(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===dd?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===qc?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Kn&&(t="SHADOWMAP_TYPE_VSM"),t}function Hx(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Ss:case ws:t="ENVMAP_TYPE_CUBE";break;case aa:t="ENVMAP_TYPE_CUBE_UV";break}return t}function Vx(i){let t="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===ws&&(t="ENVMAP_MODE_REFRACTION"),t}function Gx(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case fd:t="ENVMAP_BLENDING_MULTIPLY";break;case Ff:t="ENVMAP_BLENDING_MIX";break;case Of:t="ENVMAP_BLENDING_ADD";break}return t}function Wx(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function Xx(i,t,e,n){let s=i.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,c=Bx(e),h=Hx(e),l=Vx(e),u=Gx(e),d=Wx(e),f=Dx(e),p=Lx(r),x=s.createProgram(),g,m,w=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p].filter(lr).join(`
`),g.length>0&&(g+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p].filter(lr).join(`
`),m.length>0&&(m+=`
`)):(g=[Hu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(lr).join(`
`),m=[Hu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.envMap?"#define "+l:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==yi?"#define TONE_MAPPING":"",e.toneMapping!==yi?ne.tonemapping_pars_fragment:"",e.toneMapping!==yi?Px("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",ne.colorspace_pars_fragment,Cx("linearToOutputTexel",e.outputColorSpace),Ix(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(lr).join(`
`)),o=_c(o),o=ku(o,e),o=zu(o,e),a=_c(a),a=ku(a,e),a=zu(a,e),o=Bu(o),a=Bu(a),e.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,g=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,m=["#define varying in",e.glslVersion===tu?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===tu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let E=w+g+o,S=w+m+a,V=Nu(s,s.VERTEX_SHADER,E),O=Nu(s,s.FRAGMENT_SHADER,S);s.attachShader(x,V),s.attachShader(x,O),e.index0AttributeName!==void 0?s.bindAttribLocation(x,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function y(D){if(i.debug.checkShaderErrors){let W=s.getProgramInfoLog(x).trim(),Z=s.getShaderInfoLog(V).trim(),J=s.getShaderInfoLog(O).trim(),rt=!0,K=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(rt=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,V,O);else{let ct=Ou(s,V,"vertex"),tt=Ou(s,O,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+D.name+`
Material Type: `+D.type+`

Program Info Log: `+W+`
`+ct+`
`+tt)}else W!==""?console.warn("THREE.WebGLProgram: Program Info Log:",W):(Z===""||J==="")&&(K=!1);K&&(D.diagnostics={runnable:rt,programLog:W,vertexShader:{log:Z,prefix:g},fragmentShader:{log:J,prefix:m}})}s.deleteShader(V),s.deleteShader(O),R=new Ms(s,x),A=Ux(s,x)}let R;this.getUniforms=function(){return R===void 0&&y(this),R};let A;this.getAttributes=function(){return A===void 0&&y(this),A};let b=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=s.getProgramParameter(x,Ex)),b},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Tx++,this.cacheKey=t,this.usedTimes=1,this.program=x,this.vertexShader=V,this.fragmentShader=O,this}var qx=0,vc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new yc(t),e.set(t,n)),n}},yc=class{constructor(t){this.id=qx++,this.code=t,this.usedTimes=0}};function Yx(i,t,e,n,s,r,o){let a=new gr,c=new vc,h=new Set,l=[],u=s.logarithmicDepthBuffer,d=s.vertexTextures,f=s.precision,p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(A){return h.add(A),A===0?"uv":`uv${A}`}function g(A,b,D,W,Z){let J=W.fog,rt=Z.geometry,K=A.isMeshStandardMaterial?W.environment:null,ct=(A.isMeshStandardMaterial?e:t).get(A.envMap||K),tt=ct&&ct.mapping===aa?ct.image.height:null,et=p[A.type];A.precision!==null&&(f=s.getMaxPrecision(A.precision),f!==A.precision&&console.warn("THREE.WebGLProgram.getParameters:",A.precision,"not supported, using",f,"instead."));let _t=rt.morphAttributes.position||rt.morphAttributes.normal||rt.morphAttributes.color,It=_t!==void 0?_t.length:0,wt=0;rt.morphAttributes.position!==void 0&&(wt=1),rt.morphAttributes.normal!==void 0&&(wt=2),rt.morphAttributes.color!==void 0&&(wt=3);let Qt,st,ht,Et;if(et){let Ct=Un[et];Qt=Ct.vertexShader,st=Ct.fragmentShader}else Qt=A.vertexShader,st=A.fragmentShader,c.update(A),ht=c.getVertexShaderID(A),Et=c.getFragmentShaderID(A);let mt=i.getRenderTarget(),Vt=i.state.buffers.depth.getReversed(),Gt=Z.isInstancedMesh===!0,Zt=Z.isBatchedMesh===!0,fe=!!A.map,Dt=!!A.matcap,pe=!!ct,F=!!A.aoMap,Ie=!!A.lightMap,Rt=!!A.bumpMap,Jt=!!A.normalMap,C=!!A.displacementMap,z=!!A.emissiveMap,k=!!A.metalnessMap,v=!!A.roughnessMap,_=A.anisotropy>0,U=A.clearcoat>0,B=A.dispersion>0,H=A.iridescence>0,Y=A.sheen>0,pt=A.transmission>0,ot=_&&!!A.anisotropyMap,at=U&&!!A.clearcoatMap,Mt=U&&!!A.clearcoatNormalMap,lt=U&&!!A.clearcoatRoughnessMap,gt=H&&!!A.iridescenceMap,ut=H&&!!A.iridescenceThicknessMap,Tt=Y&&!!A.sheenColorMap,dt=Y&&!!A.sheenRoughnessMap,zt=!!A.specularMap,Bt=!!A.specularColorMap,se=!!A.specularIntensityMap,M=pt&&!!A.transmissionMap,L=pt&&!!A.thicknessMap,N=!!A.gradientMap,P=!!A.alphaMap,$=A.alphaTest>0,j=!!A.alphaHash,vt=!!A.extensions,Ut=yi;A.toneMapped&&(mt===null||mt.isXRRenderTarget===!0)&&(Ut=i.toneMapping);let Xt={shaderID:et,shaderType:A.type,shaderName:A.name,vertexShader:Qt,fragmentShader:st,defines:A.defines,customVertexShaderID:ht,customFragmentShaderID:Et,isRawShaderMaterial:A.isRawShaderMaterial===!0,glslVersion:A.glslVersion,precision:f,batching:Zt,batchingColor:Zt&&Z._colorsTexture!==null,instancing:Gt,instancingColor:Gt&&Z.instanceColor!==null,instancingMorph:Gt&&Z.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:mt===null?i.outputColorSpace:mt.isXRRenderTarget===!0?mt.texture.colorSpace:zs,alphaToCoverage:!!A.alphaToCoverage,map:fe,matcap:Dt,envMap:pe,envMapMode:pe&&ct.mapping,envMapCubeUVHeight:tt,aoMap:F,lightMap:Ie,bumpMap:Rt,normalMap:Jt,displacementMap:d&&C,emissiveMap:z,normalMapObjectSpace:Jt&&A.normalMapType===Jf,normalMapTangentSpace:Jt&&A.normalMapType===wd,metalnessMap:k,roughnessMap:v,anisotropy:_,anisotropyMap:ot,clearcoat:U,clearcoatMap:at,clearcoatNormalMap:Mt,clearcoatRoughnessMap:lt,dispersion:B,iridescence:H,iridescenceMap:gt,iridescenceThicknessMap:ut,sheen:Y,sheenColorMap:Tt,sheenRoughnessMap:dt,specularMap:zt,specularColorMap:Bt,specularIntensityMap:se,transmission:pt,transmissionMap:M,thicknessMap:L,gradientMap:N,opaque:A.transparent===!1&&A.blending===_s&&A.alphaToCoverage===!1,alphaMap:P,alphaTest:$,alphaHash:j,combine:A.combine,mapUv:fe&&x(A.map.channel),aoMapUv:F&&x(A.aoMap.channel),lightMapUv:Ie&&x(A.lightMap.channel),bumpMapUv:Rt&&x(A.bumpMap.channel),normalMapUv:Jt&&x(A.normalMap.channel),displacementMapUv:C&&x(A.displacementMap.channel),emissiveMapUv:z&&x(A.emissiveMap.channel),metalnessMapUv:k&&x(A.metalnessMap.channel),roughnessMapUv:v&&x(A.roughnessMap.channel),anisotropyMapUv:ot&&x(A.anisotropyMap.channel),clearcoatMapUv:at&&x(A.clearcoatMap.channel),clearcoatNormalMapUv:Mt&&x(A.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:lt&&x(A.clearcoatRoughnessMap.channel),iridescenceMapUv:gt&&x(A.iridescenceMap.channel),iridescenceThicknessMapUv:ut&&x(A.iridescenceThicknessMap.channel),sheenColorMapUv:Tt&&x(A.sheenColorMap.channel),sheenRoughnessMapUv:dt&&x(A.sheenRoughnessMap.channel),specularMapUv:zt&&x(A.specularMap.channel),specularColorMapUv:Bt&&x(A.specularColorMap.channel),specularIntensityMapUv:se&&x(A.specularIntensityMap.channel),transmissionMapUv:M&&x(A.transmissionMap.channel),thicknessMapUv:L&&x(A.thicknessMap.channel),alphaMapUv:P&&x(A.alphaMap.channel),vertexTangents:!!rt.attributes.tangent&&(Jt||_),vertexColors:A.vertexColors,vertexAlphas:A.vertexColors===!0&&!!rt.attributes.color&&rt.attributes.color.itemSize===4,pointsUvs:Z.isPoints===!0&&!!rt.attributes.uv&&(fe||P),fog:!!J,useFog:A.fog===!0,fogExp2:!!J&&J.isFogExp2,flatShading:A.flatShading===!0,sizeAttenuation:A.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:Vt,skinning:Z.isSkinnedMesh===!0,morphTargets:rt.morphAttributes.position!==void 0,morphNormals:rt.morphAttributes.normal!==void 0,morphColors:rt.morphAttributes.color!==void 0,morphTargetsCount:It,morphTextureStride:wt,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:A.dithering,shadowMapEnabled:i.shadowMap.enabled&&D.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ut,decodeVideoTexture:fe&&A.map.isVideoTexture===!0&&oe.getTransfer(A.map.colorSpace)===_e,decodeVideoTextureEmissive:z&&A.emissiveMap.isVideoTexture===!0&&oe.getTransfer(A.emissiveMap.colorSpace)===_e,premultipliedAlpha:A.premultipliedAlpha,doubleSided:A.side===Oe,flipSided:A.side===Ge,useDepthPacking:A.depthPacking>=0,depthPacking:A.depthPacking||0,index0AttributeName:A.index0AttributeName,extensionClipCullDistance:vt&&A.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(vt&&A.extensions.multiDraw===!0||Zt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:A.customProgramCacheKey()};return Xt.vertexUv1s=h.has(1),Xt.vertexUv2s=h.has(2),Xt.vertexUv3s=h.has(3),h.clear(),Xt}function m(A){let b=[];if(A.shaderID?b.push(A.shaderID):(b.push(A.customVertexShaderID),b.push(A.customFragmentShaderID)),A.defines!==void 0)for(let D in A.defines)b.push(D),b.push(A.defines[D]);return A.isRawShaderMaterial===!1&&(w(b,A),E(b,A),b.push(i.outputColorSpace)),b.push(A.customProgramCacheKey),b.join()}function w(A,b){A.push(b.precision),A.push(b.outputColorSpace),A.push(b.envMapMode),A.push(b.envMapCubeUVHeight),A.push(b.mapUv),A.push(b.alphaMapUv),A.push(b.lightMapUv),A.push(b.aoMapUv),A.push(b.bumpMapUv),A.push(b.normalMapUv),A.push(b.displacementMapUv),A.push(b.emissiveMapUv),A.push(b.metalnessMapUv),A.push(b.roughnessMapUv),A.push(b.anisotropyMapUv),A.push(b.clearcoatMapUv),A.push(b.clearcoatNormalMapUv),A.push(b.clearcoatRoughnessMapUv),A.push(b.iridescenceMapUv),A.push(b.iridescenceThicknessMapUv),A.push(b.sheenColorMapUv),A.push(b.sheenRoughnessMapUv),A.push(b.specularMapUv),A.push(b.specularColorMapUv),A.push(b.specularIntensityMapUv),A.push(b.transmissionMapUv),A.push(b.thicknessMapUv),A.push(b.combine),A.push(b.fogExp2),A.push(b.sizeAttenuation),A.push(b.morphTargetsCount),A.push(b.morphAttributeCount),A.push(b.numDirLights),A.push(b.numPointLights),A.push(b.numSpotLights),A.push(b.numSpotLightMaps),A.push(b.numHemiLights),A.push(b.numRectAreaLights),A.push(b.numDirLightShadows),A.push(b.numPointLightShadows),A.push(b.numSpotLightShadows),A.push(b.numSpotLightShadowsWithMaps),A.push(b.numLightProbes),A.push(b.shadowMapType),A.push(b.toneMapping),A.push(b.numClippingPlanes),A.push(b.numClipIntersection),A.push(b.depthPacking)}function E(A,b){a.disableAll(),b.supportsVertexTextures&&a.enable(0),b.instancing&&a.enable(1),b.instancingColor&&a.enable(2),b.instancingMorph&&a.enable(3),b.matcap&&a.enable(4),b.envMap&&a.enable(5),b.normalMapObjectSpace&&a.enable(6),b.normalMapTangentSpace&&a.enable(7),b.clearcoat&&a.enable(8),b.iridescence&&a.enable(9),b.alphaTest&&a.enable(10),b.vertexColors&&a.enable(11),b.vertexAlphas&&a.enable(12),b.vertexUv1s&&a.enable(13),b.vertexUv2s&&a.enable(14),b.vertexUv3s&&a.enable(15),b.vertexTangents&&a.enable(16),b.anisotropy&&a.enable(17),b.alphaHash&&a.enable(18),b.batching&&a.enable(19),b.dispersion&&a.enable(20),b.batchingColor&&a.enable(21),A.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.reverseDepthBuffer&&a.enable(4),b.skinning&&a.enable(5),b.morphTargets&&a.enable(6),b.morphNormals&&a.enable(7),b.morphColors&&a.enable(8),b.premultipliedAlpha&&a.enable(9),b.shadowMapEnabled&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.decodeVideoTextureEmissive&&a.enable(20),b.alphaToCoverage&&a.enable(21),A.push(a.mask)}function S(A){let b=p[A.type],D;if(b){let W=Un[b];D=Op.clone(W.uniforms)}else D=A.uniforms;return D}function V(A,b){let D;for(let W=0,Z=l.length;W<Z;W++){let J=l[W];if(J.cacheKey===b){D=J,++D.usedTimes;break}}return D===void 0&&(D=new Xx(i,b,A,r),l.push(D)),D}function O(A){if(--A.usedTimes===0){let b=l.indexOf(A);l[b]=l[l.length-1],l.pop(),A.destroy()}}function y(A){c.remove(A)}function R(){c.dispose()}return{getParameters:g,getProgramCacheKey:m,getUniforms:S,acquireProgram:V,releaseProgram:O,releaseShaderCache:y,programs:l,dispose:R}}function Zx(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,c){i.get(o)[a]=c}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function $x(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function Vu(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Gu(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(u,d,f,p,x,g){let m=i[t];return m===void 0?(m={id:u.id,object:u,geometry:d,material:f,groupOrder:p,renderOrder:u.renderOrder,z:x,group:g},i[t]=m):(m.id=u.id,m.object=u,m.geometry=d,m.material=f,m.groupOrder=p,m.renderOrder=u.renderOrder,m.z=x,m.group=g),t++,m}function a(u,d,f,p,x,g){let m=o(u,d,f,p,x,g);f.transmission>0?n.push(m):f.transparent===!0?s.push(m):e.push(m)}function c(u,d,f,p,x,g){let m=o(u,d,f,p,x,g);f.transmission>0?n.unshift(m):f.transparent===!0?s.unshift(m):e.unshift(m)}function h(u,d){e.length>1&&e.sort(u||$x),n.length>1&&n.sort(d||Vu),s.length>1&&s.sort(d||Vu)}function l(){for(let u=t,d=i.length;u<d;u++){let f=i[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:a,unshift:c,finish:l,sort:h}}function Jx(){let i=new WeakMap;function t(n,s){let r=i.get(n),o;return r===void 0?(o=new Gu,i.set(n,[o])):s>=r.length?(o=new Gu,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function Kx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new I,color:new Wt};break;case"SpotLight":e={position:new I,direction:new I,color:new Wt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new I,color:new Wt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new I,skyColor:new Wt,groundColor:new Wt};break;case"RectAreaLight":e={color:new Wt,position:new I,halfWidth:new I,halfHeight:new I};break}return i[t.id]=e,e}}}function jx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new yt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new yt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new yt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var Qx=0;function t_(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function e_(i){let t=new Kx,e=jx(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)n.probe.push(new I);let s=new I,r=new Yt,o=new Yt;function a(h){let l=0,u=0,d=0;for(let A=0;A<9;A++)n.probe[A].set(0,0,0);let f=0,p=0,x=0,g=0,m=0,w=0,E=0,S=0,V=0,O=0,y=0;h.sort(t_);for(let A=0,b=h.length;A<b;A++){let D=h[A],W=D.color,Z=D.intensity,J=D.distance,rt=D.shadow&&D.shadow.map?D.shadow.map.texture:null;if(D.isAmbientLight)l+=W.r*Z,u+=W.g*Z,d+=W.b*Z;else if(D.isLightProbe){for(let K=0;K<9;K++)n.probe[K].addScaledVector(D.sh.coefficients[K],Z);y++}else if(D.isDirectionalLight){let K=t.get(D);if(K.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let ct=D.shadow,tt=e.get(D);tt.shadowIntensity=ct.intensity,tt.shadowBias=ct.bias,tt.shadowNormalBias=ct.normalBias,tt.shadowRadius=ct.radius,tt.shadowMapSize=ct.mapSize,n.directionalShadow[f]=tt,n.directionalShadowMap[f]=rt,n.directionalShadowMatrix[f]=D.shadow.matrix,w++}n.directional[f]=K,f++}else if(D.isSpotLight){let K=t.get(D);K.position.setFromMatrixPosition(D.matrixWorld),K.color.copy(W).multiplyScalar(Z),K.distance=J,K.coneCos=Math.cos(D.angle),K.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),K.decay=D.decay,n.spot[x]=K;let ct=D.shadow;if(D.map&&(n.spotLightMap[V]=D.map,V++,ct.updateMatrices(D),D.castShadow&&O++),n.spotLightMatrix[x]=ct.matrix,D.castShadow){let tt=e.get(D);tt.shadowIntensity=ct.intensity,tt.shadowBias=ct.bias,tt.shadowNormalBias=ct.normalBias,tt.shadowRadius=ct.radius,tt.shadowMapSize=ct.mapSize,n.spotShadow[x]=tt,n.spotShadowMap[x]=rt,S++}x++}else if(D.isRectAreaLight){let K=t.get(D);K.color.copy(W).multiplyScalar(Z),K.halfWidth.set(D.width*.5,0,0),K.halfHeight.set(0,D.height*.5,0),n.rectArea[g]=K,g++}else if(D.isPointLight){let K=t.get(D);if(K.color.copy(D.color).multiplyScalar(D.intensity),K.distance=D.distance,K.decay=D.decay,D.castShadow){let ct=D.shadow,tt=e.get(D);tt.shadowIntensity=ct.intensity,tt.shadowBias=ct.bias,tt.shadowNormalBias=ct.normalBias,tt.shadowRadius=ct.radius,tt.shadowMapSize=ct.mapSize,tt.shadowCameraNear=ct.camera.near,tt.shadowCameraFar=ct.camera.far,n.pointShadow[p]=tt,n.pointShadowMap[p]=rt,n.pointShadowMatrix[p]=D.shadow.matrix,E++}n.point[p]=K,p++}else if(D.isHemisphereLight){let K=t.get(D);K.skyColor.copy(D.color).multiplyScalar(Z),K.groundColor.copy(D.groundColor).multiplyScalar(Z),n.hemi[m]=K,m++}}g>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=bt.LTC_FLOAT_1,n.rectAreaLTC2=bt.LTC_FLOAT_2):(n.rectAreaLTC1=bt.LTC_HALF_1,n.rectAreaLTC2=bt.LTC_HALF_2)),n.ambient[0]=l,n.ambient[1]=u,n.ambient[2]=d;let R=n.hash;(R.directionalLength!==f||R.pointLength!==p||R.spotLength!==x||R.rectAreaLength!==g||R.hemiLength!==m||R.numDirectionalShadows!==w||R.numPointShadows!==E||R.numSpotShadows!==S||R.numSpotMaps!==V||R.numLightProbes!==y)&&(n.directional.length=f,n.spot.length=x,n.rectArea.length=g,n.point.length=p,n.hemi.length=m,n.directionalShadow.length=w,n.directionalShadowMap.length=w,n.pointShadow.length=E,n.pointShadowMap.length=E,n.spotShadow.length=S,n.spotShadowMap.length=S,n.directionalShadowMatrix.length=w,n.pointShadowMatrix.length=E,n.spotLightMatrix.length=S+V-O,n.spotLightMap.length=V,n.numSpotLightShadowsWithMaps=O,n.numLightProbes=y,R.directionalLength=f,R.pointLength=p,R.spotLength=x,R.rectAreaLength=g,R.hemiLength=m,R.numDirectionalShadows=w,R.numPointShadows=E,R.numSpotShadows=S,R.numSpotMaps=V,R.numLightProbes=y,n.version=Qx++)}function c(h,l){let u=0,d=0,f=0,p=0,x=0,g=l.matrixWorldInverse;for(let m=0,w=h.length;m<w;m++){let E=h[m];if(E.isDirectionalLight){let S=n.directional[u];S.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(g),u++}else if(E.isSpotLight){let S=n.spot[f];S.position.setFromMatrixPosition(E.matrixWorld),S.position.applyMatrix4(g),S.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(g),f++}else if(E.isRectAreaLight){let S=n.rectArea[p];S.position.setFromMatrixPosition(E.matrixWorld),S.position.applyMatrix4(g),o.identity(),r.copy(E.matrixWorld),r.premultiply(g),o.extractRotation(r),S.halfWidth.set(E.width*.5,0,0),S.halfHeight.set(0,E.height*.5,0),S.halfWidth.applyMatrix4(o),S.halfHeight.applyMatrix4(o),p++}else if(E.isPointLight){let S=n.point[d];S.position.setFromMatrixPosition(E.matrixWorld),S.position.applyMatrix4(g),d++}else if(E.isHemisphereLight){let S=n.hemi[x];S.direction.setFromMatrixPosition(E.matrixWorld),S.direction.transformDirection(g),x++}}}return{setup:a,setupView:c,state:n}}function Wu(i){let t=new e_(i),e=[],n=[];function s(l){h.camera=l,e.length=0,n.length=0}function r(l){e.push(l)}function o(l){n.push(l)}function a(){t.setup(e)}function c(l){t.setupView(e,l)}let h={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:h,setupLights:a,setupLightsView:c,pushLight:r,pushShadow:o}}function n_(i){let t=new WeakMap;function e(s,r=0){let o=t.get(s),a;return o===void 0?(a=new Wu(i),t.set(s,[a])):r>=o.length?(a=new Wu(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}var Mc=class extends Gi{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Zf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},bc=class extends Gi{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}},i_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,s_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function r_(i,t,e){let n=new xr,s=new yt,r=new yt,o=new ce,a=new Mc({depthPacking:$f}),c=new bc,h={},l=e.maxTextureSize,u={[Mi]:Ge,[Ge]:Mi,[Oe]:Oe},d=new _n({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new yt},radius:{value:4}},vertexShader:i_,fragmentShader:s_}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let p=new Xe;p.setAttribute("position",new Te(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new qt(p,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=dd;let m=this.type;this.render=function(O,y,R){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||O.length===0)return;let A=i.getRenderTarget(),b=i.getActiveCubeFace(),D=i.getActiveMipmapLevel(),W=i.state;W.setBlending(vi),W.buffers.color.setClear(1,1,1,1),W.buffers.depth.setTest(!0),W.setScissorTest(!1);let Z=m!==Kn&&this.type===Kn,J=m===Kn&&this.type!==Kn;for(let rt=0,K=O.length;rt<K;rt++){let ct=O[rt],tt=ct.shadow;if(tt===void 0){console.warn("THREE.WebGLShadowMap:",ct,"has no shadow.");continue}if(tt.autoUpdate===!1&&tt.needsUpdate===!1)continue;s.copy(tt.mapSize);let et=tt.getFrameExtents();if(s.multiply(et),r.copy(tt.mapSize),(s.x>l||s.y>l)&&(s.x>l&&(r.x=Math.floor(l/et.x),s.x=r.x*et.x,tt.mapSize.x=r.x),s.y>l&&(r.y=Math.floor(l/et.y),s.y=r.y*et.y,tt.mapSize.y=r.y)),tt.map===null||Z===!0||J===!0){let It=this.type!==Kn?{minFilter:Ke,magFilter:Ke}:{};tt.map!==null&&tt.map.dispose(),tt.map=new je(s.x,s.y,It),tt.map.texture.name=ct.name+".shadowMap",tt.camera.updateProjectionMatrix()}i.setRenderTarget(tt.map),i.clear();let _t=tt.getViewportCount();for(let It=0;It<_t;It++){let wt=tt.getViewport(It);o.set(r.x*wt.x,r.y*wt.y,r.x*wt.z,r.y*wt.w),W.viewport(o),tt.updateMatrices(ct,It),n=tt.getFrustum(),S(y,R,tt.camera,ct,this.type)}tt.isPointLightShadow!==!0&&this.type===Kn&&w(tt,R),tt.needsUpdate=!1}m=this.type,g.needsUpdate=!1,i.setRenderTarget(A,b,D)};function w(O,y){let R=t.update(x);d.defines.VSM_SAMPLES!==O.blurSamples&&(d.defines.VSM_SAMPLES=O.blurSamples,f.defines.VSM_SAMPLES=O.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),O.mapPass===null&&(O.mapPass=new je(s.x,s.y)),d.uniforms.shadow_pass.value=O.map.texture,d.uniforms.resolution.value=O.mapSize,d.uniforms.radius.value=O.radius,i.setRenderTarget(O.mapPass),i.clear(),i.renderBufferDirect(y,null,R,d,x,null),f.uniforms.shadow_pass.value=O.mapPass.texture,f.uniforms.resolution.value=O.mapSize,f.uniforms.radius.value=O.radius,i.setRenderTarget(O.map),i.clear(),i.renderBufferDirect(y,null,R,f,x,null)}function E(O,y,R,A){let b=null,D=R.isPointLight===!0?O.customDistanceMaterial:O.customDepthMaterial;if(D!==void 0)b=D;else if(b=R.isPointLight===!0?c:a,i.localClippingEnabled&&y.clipShadows===!0&&Array.isArray(y.clippingPlanes)&&y.clippingPlanes.length!==0||y.displacementMap&&y.displacementScale!==0||y.alphaMap&&y.alphaTest>0||y.map&&y.alphaTest>0){let W=b.uuid,Z=y.uuid,J=h[W];J===void 0&&(J={},h[W]=J);let rt=J[Z];rt===void 0&&(rt=b.clone(),J[Z]=rt,y.addEventListener("dispose",V)),b=rt}if(b.visible=y.visible,b.wireframe=y.wireframe,A===Kn?b.side=y.shadowSide!==null?y.shadowSide:y.side:b.side=y.shadowSide!==null?y.shadowSide:u[y.side],b.alphaMap=y.alphaMap,b.alphaTest=y.alphaTest,b.map=y.map,b.clipShadows=y.clipShadows,b.clippingPlanes=y.clippingPlanes,b.clipIntersection=y.clipIntersection,b.displacementMap=y.displacementMap,b.displacementScale=y.displacementScale,b.displacementBias=y.displacementBias,b.wireframeLinewidth=y.wireframeLinewidth,b.linewidth=y.linewidth,R.isPointLight===!0&&b.isMeshDistanceMaterial===!0){let W=i.properties.get(b);W.light=R}return b}function S(O,y,R,A,b){if(O.visible===!1)return;if(O.layers.test(y.layers)&&(O.isMesh||O.isLine||O.isPoints)&&(O.castShadow||O.receiveShadow&&b===Kn)&&(!O.frustumCulled||n.intersectsObject(O))){O.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,O.matrixWorld);let Z=t.update(O),J=O.material;if(Array.isArray(J)){let rt=Z.groups;for(let K=0,ct=rt.length;K<ct;K++){let tt=rt[K],et=J[tt.materialIndex];if(et&&et.visible){let _t=E(O,et,A,b);O.onBeforeShadow(i,O,y,R,Z,_t,tt),i.renderBufferDirect(R,null,Z,_t,O,tt),O.onAfterShadow(i,O,y,R,Z,_t,tt)}}}else if(J.visible){let rt=E(O,J,A,b);O.onBeforeShadow(i,O,y,R,Z,rt,null),i.renderBufferDirect(R,null,Z,rt,O,null),O.onAfterShadow(i,O,y,R,Z,rt,null)}}let W=O.children;for(let Z=0,J=W.length;Z<J;Z++)S(W[Z],y,R,A,b)}function V(O){O.target.removeEventListener("dispose",V);for(let R in h){let A=h[R],b=O.target.uuid;b in A&&(A[b].dispose(),delete A[b])}}}var o_={[Al]:Rl,[Cl]:Dl,[Pl]:Ll,[bs]:Il,[Rl]:Al,[Dl]:Cl,[Ll]:Pl,[Il]:bs};function a_(i,t){function e(){let M=!1,L=new ce,N=null,P=new ce(0,0,0,0);return{setMask:function($){N!==$&&!M&&(i.colorMask($,$,$,$),N=$)},setLocked:function($){M=$},setClear:function($,j,vt,Ut,Xt){Xt===!0&&($*=Ut,j*=Ut,vt*=Ut),L.set($,j,vt,Ut),P.equals(L)===!1&&(i.clearColor($,j,vt,Ut),P.copy(L))},reset:function(){M=!1,N=null,P.set(-1,0,0,0)}}}function n(){let M=!1,L=!1,N=null,P=null,$=null;return{setReversed:function(j){if(L!==j){let vt=t.get("EXT_clip_control");L?vt.clipControlEXT(vt.LOWER_LEFT_EXT,vt.ZERO_TO_ONE_EXT):vt.clipControlEXT(vt.LOWER_LEFT_EXT,vt.NEGATIVE_ONE_TO_ONE_EXT);let Ut=$;$=null,this.setClear(Ut)}L=j},getReversed:function(){return L},setTest:function(j){j?mt(i.DEPTH_TEST):Vt(i.DEPTH_TEST)},setMask:function(j){N!==j&&!M&&(i.depthMask(j),N=j)},setFunc:function(j){if(L&&(j=o_[j]),P!==j){switch(j){case Al:i.depthFunc(i.NEVER);break;case Rl:i.depthFunc(i.ALWAYS);break;case Cl:i.depthFunc(i.LESS);break;case bs:i.depthFunc(i.LEQUAL);break;case Pl:i.depthFunc(i.EQUAL);break;case Il:i.depthFunc(i.GEQUAL);break;case Dl:i.depthFunc(i.GREATER);break;case Ll:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}P=j}},setLocked:function(j){M=j},setClear:function(j){$!==j&&(L&&(j=1-j),i.clearDepth(j),$=j)},reset:function(){M=!1,N=null,P=null,$=null,L=!1}}}function s(){let M=!1,L=null,N=null,P=null,$=null,j=null,vt=null,Ut=null,Xt=null;return{setTest:function(Ct){M||(Ct?mt(i.STENCIL_TEST):Vt(i.STENCIL_TEST))},setMask:function(Ct){L!==Ct&&!M&&(i.stencilMask(Ct),L=Ct)},setFunc:function(Ct,me,Re){(N!==Ct||P!==me||$!==Re)&&(i.stencilFunc(Ct,me,Re),N=Ct,P=me,$=Re)},setOp:function(Ct,me,Re){(j!==Ct||vt!==me||Ut!==Re)&&(i.stencilOp(Ct,me,Re),j=Ct,vt=me,Ut=Re)},setLocked:function(Ct){M=Ct},setClear:function(Ct){Xt!==Ct&&(i.clearStencil(Ct),Xt=Ct)},reset:function(){M=!1,L=null,N=null,P=null,$=null,j=null,vt=null,Ut=null,Xt=null}}}let r=new e,o=new n,a=new s,c=new WeakMap,h=new WeakMap,l={},u={},d=new WeakMap,f=[],p=null,x=!1,g=null,m=null,w=null,E=null,S=null,V=null,O=null,y=new Wt(0,0,0),R=0,A=!1,b=null,D=null,W=null,Z=null,J=null,rt=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),K=!1,ct=0,tt=i.getParameter(i.VERSION);tt.indexOf("WebGL")!==-1?(ct=parseFloat(/^WebGL (\d)/.exec(tt)[1]),K=ct>=1):tt.indexOf("OpenGL ES")!==-1&&(ct=parseFloat(/^OpenGL ES (\d)/.exec(tt)[1]),K=ct>=2);let et=null,_t={},It=i.getParameter(i.SCISSOR_BOX),wt=i.getParameter(i.VIEWPORT),Qt=new ce().fromArray(It),st=new ce().fromArray(wt);function ht(M,L,N,P){let $=new Uint8Array(4),j=i.createTexture();i.bindTexture(M,j),i.texParameteri(M,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(M,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let vt=0;vt<N;vt++)M===i.TEXTURE_3D||M===i.TEXTURE_2D_ARRAY?i.texImage3D(L,0,i.RGBA,1,1,P,0,i.RGBA,i.UNSIGNED_BYTE,$):i.texImage2D(L+vt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,$);return j}let Et={};Et[i.TEXTURE_2D]=ht(i.TEXTURE_2D,i.TEXTURE_2D,1),Et[i.TEXTURE_CUBE_MAP]=ht(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Et[i.TEXTURE_2D_ARRAY]=ht(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Et[i.TEXTURE_3D]=ht(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),mt(i.DEPTH_TEST),o.setFunc(bs),Rt(!1),Jt(Zh),mt(i.CULL_FACE),F(vi);function mt(M){l[M]!==!0&&(i.enable(M),l[M]=!0)}function Vt(M){l[M]!==!1&&(i.disable(M),l[M]=!1)}function Gt(M,L){return u[M]!==L?(i.bindFramebuffer(M,L),u[M]=L,M===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=L),M===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=L),!0):!1}function Zt(M,L){let N=f,P=!1;if(M){N=d.get(L),N===void 0&&(N=[],d.set(L,N));let $=M.textures;if(N.length!==$.length||N[0]!==i.COLOR_ATTACHMENT0){for(let j=0,vt=$.length;j<vt;j++)N[j]=i.COLOR_ATTACHMENT0+j;N.length=$.length,P=!0}}else N[0]!==i.BACK&&(N[0]=i.BACK,P=!0);P&&i.drawBuffers(N)}function fe(M){return p!==M?(i.useProgram(M),p=M,!0):!1}let Dt={[zi]:i.FUNC_ADD,[vf]:i.FUNC_SUBTRACT,[yf]:i.FUNC_REVERSE_SUBTRACT};Dt[Mf]=i.MIN,Dt[bf]=i.MAX;let pe={[Sf]:i.ZERO,[wf]:i.ONE,[Ef]:i.SRC_COLOR,[El]:i.SRC_ALPHA,[If]:i.SRC_ALPHA_SATURATE,[Cf]:i.DST_COLOR,[Af]:i.DST_ALPHA,[Tf]:i.ONE_MINUS_SRC_COLOR,[Tl]:i.ONE_MINUS_SRC_ALPHA,[Pf]:i.ONE_MINUS_DST_COLOR,[Rf]:i.ONE_MINUS_DST_ALPHA,[Df]:i.CONSTANT_COLOR,[Lf]:i.ONE_MINUS_CONSTANT_COLOR,[Uf]:i.CONSTANT_ALPHA,[Nf]:i.ONE_MINUS_CONSTANT_ALPHA};function F(M,L,N,P,$,j,vt,Ut,Xt,Ct){if(M===vi){x===!0&&(Vt(i.BLEND),x=!1);return}if(x===!1&&(mt(i.BLEND),x=!0),M!==_f){if(M!==g||Ct!==A){if((m!==zi||S!==zi)&&(i.blendEquation(i.FUNC_ADD),m=zi,S=zi),Ct)switch(M){case _s:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Co:i.blendFunc(i.ONE,i.ONE);break;case $h:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Jh:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",M);break}else switch(M){case _s:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Co:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case $h:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Jh:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",M);break}w=null,E=null,V=null,O=null,y.set(0,0,0),R=0,g=M,A=Ct}return}$=$||L,j=j||N,vt=vt||P,(L!==m||$!==S)&&(i.blendEquationSeparate(Dt[L],Dt[$]),m=L,S=$),(N!==w||P!==E||j!==V||vt!==O)&&(i.blendFuncSeparate(pe[N],pe[P],pe[j],pe[vt]),w=N,E=P,V=j,O=vt),(Ut.equals(y)===!1||Xt!==R)&&(i.blendColor(Ut.r,Ut.g,Ut.b,Xt),y.copy(Ut),R=Xt),g=M,A=!1}function Ie(M,L){M.side===Oe?Vt(i.CULL_FACE):mt(i.CULL_FACE);let N=M.side===Ge;L&&(N=!N),Rt(N),M.blending===_s&&M.transparent===!1?F(vi):F(M.blending,M.blendEquation,M.blendSrc,M.blendDst,M.blendEquationAlpha,M.blendSrcAlpha,M.blendDstAlpha,M.blendColor,M.blendAlpha,M.premultipliedAlpha),o.setFunc(M.depthFunc),o.setTest(M.depthTest),o.setMask(M.depthWrite),r.setMask(M.colorWrite);let P=M.stencilWrite;a.setTest(P),P&&(a.setMask(M.stencilWriteMask),a.setFunc(M.stencilFunc,M.stencilRef,M.stencilFuncMask),a.setOp(M.stencilFail,M.stencilZFail,M.stencilZPass)),z(M.polygonOffset,M.polygonOffsetFactor,M.polygonOffsetUnits),M.alphaToCoverage===!0?mt(i.SAMPLE_ALPHA_TO_COVERAGE):Vt(i.SAMPLE_ALPHA_TO_COVERAGE)}function Rt(M){b!==M&&(M?i.frontFace(i.CW):i.frontFace(i.CCW),b=M)}function Jt(M){M!==gf?(mt(i.CULL_FACE),M!==D&&(M===Zh?i.cullFace(i.BACK):M===xf?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Vt(i.CULL_FACE),D=M}function C(M){M!==W&&(K&&i.lineWidth(M),W=M)}function z(M,L,N){M?(mt(i.POLYGON_OFFSET_FILL),(Z!==L||J!==N)&&(i.polygonOffset(L,N),Z=L,J=N)):Vt(i.POLYGON_OFFSET_FILL)}function k(M){M?mt(i.SCISSOR_TEST):Vt(i.SCISSOR_TEST)}function v(M){M===void 0&&(M=i.TEXTURE0+rt-1),et!==M&&(i.activeTexture(M),et=M)}function _(M,L,N){N===void 0&&(et===null?N=i.TEXTURE0+rt-1:N=et);let P=_t[N];P===void 0&&(P={type:void 0,texture:void 0},_t[N]=P),(P.type!==M||P.texture!==L)&&(et!==N&&(i.activeTexture(N),et=N),i.bindTexture(M,L||Et[M]),P.type=M,P.texture=L)}function U(){let M=_t[et];M!==void 0&&M.type!==void 0&&(i.bindTexture(M.type,null),M.type=void 0,M.texture=void 0)}function B(){try{i.compressedTexImage2D.apply(i,arguments)}catch(M){console.error("THREE.WebGLState:",M)}}function H(){try{i.compressedTexImage3D.apply(i,arguments)}catch(M){console.error("THREE.WebGLState:",M)}}function Y(){try{i.texSubImage2D.apply(i,arguments)}catch(M){console.error("THREE.WebGLState:",M)}}function pt(){try{i.texSubImage3D.apply(i,arguments)}catch(M){console.error("THREE.WebGLState:",M)}}function ot(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(M){console.error("THREE.WebGLState:",M)}}function at(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(M){console.error("THREE.WebGLState:",M)}}function Mt(){try{i.texStorage2D.apply(i,arguments)}catch(M){console.error("THREE.WebGLState:",M)}}function lt(){try{i.texStorage3D.apply(i,arguments)}catch(M){console.error("THREE.WebGLState:",M)}}function gt(){try{i.texImage2D.apply(i,arguments)}catch(M){console.error("THREE.WebGLState:",M)}}function ut(){try{i.texImage3D.apply(i,arguments)}catch(M){console.error("THREE.WebGLState:",M)}}function Tt(M){Qt.equals(M)===!1&&(i.scissor(M.x,M.y,M.z,M.w),Qt.copy(M))}function dt(M){st.equals(M)===!1&&(i.viewport(M.x,M.y,M.z,M.w),st.copy(M))}function zt(M,L){let N=h.get(L);N===void 0&&(N=new WeakMap,h.set(L,N));let P=N.get(M);P===void 0&&(P=i.getUniformBlockIndex(L,M.name),N.set(M,P))}function Bt(M,L){let P=h.get(L).get(M);c.get(L)!==P&&(i.uniformBlockBinding(L,P,M.__bindingPointIndex),c.set(L,P))}function se(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),l={},et=null,_t={},u={},d=new WeakMap,f=[],p=null,x=!1,g=null,m=null,w=null,E=null,S=null,V=null,O=null,y=new Wt(0,0,0),R=0,A=!1,b=null,D=null,W=null,Z=null,J=null,Qt.set(0,0,i.canvas.width,i.canvas.height),st.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:mt,disable:Vt,bindFramebuffer:Gt,drawBuffers:Zt,useProgram:fe,setBlending:F,setMaterial:Ie,setFlipSided:Rt,setCullFace:Jt,setLineWidth:C,setPolygonOffset:z,setScissorTest:k,activeTexture:v,bindTexture:_,unbindTexture:U,compressedTexImage2D:B,compressedTexImage3D:H,texImage2D:gt,texImage3D:ut,updateUBOMapping:zt,uniformBlockBinding:Bt,texStorage2D:Mt,texStorage3D:lt,texSubImage2D:Y,texSubImage3D:pt,compressedTexSubImage2D:ot,compressedTexSubImage3D:at,scissor:Tt,viewport:dt,reset:se}}function Xu(i,t,e,n){let s=l_(n);switch(e){case _d:return i*t;case yd:return i*t;case Md:return i*t*2;case Kc:return i*t/s.components*s.byteLength;case jc:return i*t/s.components*s.byteLength;case bd:return i*t*2/s.components*s.byteLength;case Qc:return i*t*2/s.components*s.byteLength;case vd:return i*t*3/s.components*s.byteLength;case gn:return i*t*4/s.components*s.byteLength;case th:return i*t*4/s.components*s.byteLength;case wo:case Eo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case To:case Ao:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case kl:case Bl:return Math.max(i,16)*Math.max(t,8)/4;case Ol:case zl:return Math.max(i,8)*Math.max(t,8)/2;case Hl:case Vl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Gl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Wl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Xl:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case ql:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Yl:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Zl:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case $l:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Jl:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Kl:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case jl:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Ql:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case tc:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case ec:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case nc:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case ic:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Ro:case sc:case rc:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Sd:case oc:return Math.ceil(i/4)*Math.ceil(t/4)*8;case ac:case lc:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function l_(i){switch(i){case ei:case md:return{byteLength:1,components:1};case mr:case gd:case oi:return{byteLength:2,components:1};case $c:case Jc:return{byteLength:2,components:4};case ni:case Zc:case Cn:return{byteLength:4,components:1};case xd:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function c_(i,t,e,n,s,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new yt,l=new WeakMap,u,d=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function p(v,_){return f?new OffscreenCanvas(v,_):Lo("canvas")}function x(v,_,U){let B=1,H=k(v);if((H.width>U||H.height>U)&&(B=U/Math.max(H.width,H.height)),B<1)if(typeof HTMLImageElement<"u"&&v instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&v instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&v instanceof ImageBitmap||typeof VideoFrame<"u"&&v instanceof VideoFrame){let Y=Math.floor(B*H.width),pt=Math.floor(B*H.height);u===void 0&&(u=p(Y,pt));let ot=_?p(Y,pt):u;return ot.width=Y,ot.height=pt,ot.getContext("2d").drawImage(v,0,0,Y,pt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+H.width+"x"+H.height+") to ("+Y+"x"+pt+")."),ot}else return"data"in v&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+H.width+"x"+H.height+")."),v;return v}function g(v){return v.generateMipmaps}function m(v){i.generateMipmap(v)}function w(v){return v.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:v.isWebGL3DRenderTarget?i.TEXTURE_3D:v.isWebGLArrayRenderTarget||v.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function E(v,_,U,B,H=!1){if(v!==null){if(i[v]!==void 0)return i[v];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+v+"'")}let Y=_;if(_===i.RED&&(U===i.FLOAT&&(Y=i.R32F),U===i.HALF_FLOAT&&(Y=i.R16F),U===i.UNSIGNED_BYTE&&(Y=i.R8)),_===i.RED_INTEGER&&(U===i.UNSIGNED_BYTE&&(Y=i.R8UI),U===i.UNSIGNED_SHORT&&(Y=i.R16UI),U===i.UNSIGNED_INT&&(Y=i.R32UI),U===i.BYTE&&(Y=i.R8I),U===i.SHORT&&(Y=i.R16I),U===i.INT&&(Y=i.R32I)),_===i.RG&&(U===i.FLOAT&&(Y=i.RG32F),U===i.HALF_FLOAT&&(Y=i.RG16F),U===i.UNSIGNED_BYTE&&(Y=i.RG8)),_===i.RG_INTEGER&&(U===i.UNSIGNED_BYTE&&(Y=i.RG8UI),U===i.UNSIGNED_SHORT&&(Y=i.RG16UI),U===i.UNSIGNED_INT&&(Y=i.RG32UI),U===i.BYTE&&(Y=i.RG8I),U===i.SHORT&&(Y=i.RG16I),U===i.INT&&(Y=i.RG32I)),_===i.RGB_INTEGER&&(U===i.UNSIGNED_BYTE&&(Y=i.RGB8UI),U===i.UNSIGNED_SHORT&&(Y=i.RGB16UI),U===i.UNSIGNED_INT&&(Y=i.RGB32UI),U===i.BYTE&&(Y=i.RGB8I),U===i.SHORT&&(Y=i.RGB16I),U===i.INT&&(Y=i.RGB32I)),_===i.RGBA_INTEGER&&(U===i.UNSIGNED_BYTE&&(Y=i.RGBA8UI),U===i.UNSIGNED_SHORT&&(Y=i.RGBA16UI),U===i.UNSIGNED_INT&&(Y=i.RGBA32UI),U===i.BYTE&&(Y=i.RGBA8I),U===i.SHORT&&(Y=i.RGBA16I),U===i.INT&&(Y=i.RGBA32I)),_===i.RGB&&U===i.UNSIGNED_INT_5_9_9_9_REV&&(Y=i.RGB9_E5),_===i.RGBA){let pt=H?ca:oe.getTransfer(B);U===i.FLOAT&&(Y=i.RGBA32F),U===i.HALF_FLOAT&&(Y=i.RGBA16F),U===i.UNSIGNED_BYTE&&(Y=pt===_e?i.SRGB8_ALPHA8:i.RGBA8),U===i.UNSIGNED_SHORT_4_4_4_4&&(Y=i.RGBA4),U===i.UNSIGNED_SHORT_5_5_5_1&&(Y=i.RGB5_A1)}return(Y===i.R16F||Y===i.R32F||Y===i.RG16F||Y===i.RG32F||Y===i.RGBA16F||Y===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Y}function S(v,_){let U;return v?_===null||_===ni||_===Es?U=i.DEPTH24_STENCIL8:_===Cn?U=i.DEPTH32F_STENCIL8:_===mr&&(U=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===ni||_===Es?U=i.DEPTH_COMPONENT24:_===Cn?U=i.DEPTH_COMPONENT32F:_===mr&&(U=i.DEPTH_COMPONENT16),U}function V(v,_){return g(v)===!0||v.isFramebufferTexture&&v.minFilter!==Ke&&v.minFilter!==Fn?Math.log2(Math.max(_.width,_.height))+1:v.mipmaps!==void 0&&v.mipmaps.length>0?v.mipmaps.length:v.isCompressedTexture&&Array.isArray(v.image)?_.mipmaps.length:1}function O(v){let _=v.target;_.removeEventListener("dispose",O),R(_),_.isVideoTexture&&l.delete(_)}function y(v){let _=v.target;_.removeEventListener("dispose",y),b(_)}function R(v){let _=n.get(v);if(_.__webglInit===void 0)return;let U=v.source,B=d.get(U);if(B){let H=B[_.__cacheKey];H.usedTimes--,H.usedTimes===0&&A(v),Object.keys(B).length===0&&d.delete(U)}n.remove(v)}function A(v){let _=n.get(v);i.deleteTexture(_.__webglTexture);let U=v.source,B=d.get(U);delete B[_.__cacheKey],o.memory.textures--}function b(v){let _=n.get(v);if(v.depthTexture&&(v.depthTexture.dispose(),n.remove(v.depthTexture)),v.isWebGLCubeRenderTarget)for(let B=0;B<6;B++){if(Array.isArray(_.__webglFramebuffer[B]))for(let H=0;H<_.__webglFramebuffer[B].length;H++)i.deleteFramebuffer(_.__webglFramebuffer[B][H]);else i.deleteFramebuffer(_.__webglFramebuffer[B]);_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer[B])}else{if(Array.isArray(_.__webglFramebuffer))for(let B=0;B<_.__webglFramebuffer.length;B++)i.deleteFramebuffer(_.__webglFramebuffer[B]);else i.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&i.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&i.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let B=0;B<_.__webglColorRenderbuffer.length;B++)_.__webglColorRenderbuffer[B]&&i.deleteRenderbuffer(_.__webglColorRenderbuffer[B]);_.__webglDepthRenderbuffer&&i.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let U=v.textures;for(let B=0,H=U.length;B<H;B++){let Y=n.get(U[B]);Y.__webglTexture&&(i.deleteTexture(Y.__webglTexture),o.memory.textures--),n.remove(U[B])}n.remove(v)}let D=0;function W(){D=0}function Z(){let v=D;return v>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+v+" texture units while this GPU supports only "+s.maxTextures),D+=1,v}function J(v){let _=[];return _.push(v.wrapS),_.push(v.wrapT),_.push(v.wrapR||0),_.push(v.magFilter),_.push(v.minFilter),_.push(v.anisotropy),_.push(v.internalFormat),_.push(v.format),_.push(v.type),_.push(v.generateMipmaps),_.push(v.premultiplyAlpha),_.push(v.flipY),_.push(v.unpackAlignment),_.push(v.colorSpace),_.join()}function rt(v,_){let U=n.get(v);if(v.isVideoTexture&&C(v),v.isRenderTargetTexture===!1&&v.version>0&&U.__version!==v.version){let B=v.image;if(B===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(B.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{st(U,v,_);return}}e.bindTexture(i.TEXTURE_2D,U.__webglTexture,i.TEXTURE0+_)}function K(v,_){let U=n.get(v);if(v.version>0&&U.__version!==v.version){st(U,v,_);return}e.bindTexture(i.TEXTURE_2D_ARRAY,U.__webglTexture,i.TEXTURE0+_)}function ct(v,_){let U=n.get(v);if(v.version>0&&U.__version!==v.version){st(U,v,_);return}e.bindTexture(i.TEXTURE_3D,U.__webglTexture,i.TEXTURE0+_)}function tt(v,_){let U=n.get(v);if(v.version>0&&U.__version!==v.version){ht(U,v,_);return}e.bindTexture(i.TEXTURE_CUBE_MAP,U.__webglTexture,i.TEXTURE0+_)}let et={[On]:i.REPEAT,[Nn]:i.CLAMP_TO_EDGE,[Fl]:i.MIRRORED_REPEAT},_t={[Ke]:i.NEAREST,[Xf]:i.NEAREST_MIPMAP_NEAREST,[Jr]:i.NEAREST_MIPMAP_LINEAR,[Fn]:i.LINEAR,[Wa]:i.LINEAR_MIPMAP_NEAREST,[jn]:i.LINEAR_MIPMAP_LINEAR},It={[Kf]:i.NEVER,[ip]:i.ALWAYS,[jf]:i.LESS,[Ed]:i.LEQUAL,[Qf]:i.EQUAL,[np]:i.GEQUAL,[tp]:i.GREATER,[ep]:i.NOTEQUAL};function wt(v,_){if(_.type===Cn&&t.has("OES_texture_float_linear")===!1&&(_.magFilter===Fn||_.magFilter===Wa||_.magFilter===Jr||_.magFilter===jn||_.minFilter===Fn||_.minFilter===Wa||_.minFilter===Jr||_.minFilter===jn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(v,i.TEXTURE_WRAP_S,et[_.wrapS]),i.texParameteri(v,i.TEXTURE_WRAP_T,et[_.wrapT]),(v===i.TEXTURE_3D||v===i.TEXTURE_2D_ARRAY)&&i.texParameteri(v,i.TEXTURE_WRAP_R,et[_.wrapR]),i.texParameteri(v,i.TEXTURE_MAG_FILTER,_t[_.magFilter]),i.texParameteri(v,i.TEXTURE_MIN_FILTER,_t[_.minFilter]),_.compareFunction&&(i.texParameteri(v,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(v,i.TEXTURE_COMPARE_FUNC,It[_.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Ke||_.minFilter!==Jr&&_.minFilter!==jn||_.type===Cn&&t.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){let U=t.get("EXT_texture_filter_anisotropic");i.texParameterf(v,U.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function Qt(v,_){let U=!1;v.__webglInit===void 0&&(v.__webglInit=!0,_.addEventListener("dispose",O));let B=_.source,H=d.get(B);H===void 0&&(H={},d.set(B,H));let Y=J(_);if(Y!==v.__cacheKey){H[Y]===void 0&&(H[Y]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,U=!0),H[Y].usedTimes++;let pt=H[v.__cacheKey];pt!==void 0&&(H[v.__cacheKey].usedTimes--,pt.usedTimes===0&&A(_)),v.__cacheKey=Y,v.__webglTexture=H[Y].texture}return U}function st(v,_,U){let B=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(B=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&(B=i.TEXTURE_3D);let H=Qt(v,_),Y=_.source;e.bindTexture(B,v.__webglTexture,i.TEXTURE0+U);let pt=n.get(Y);if(Y.version!==pt.__version||H===!0){e.activeTexture(i.TEXTURE0+U);let ot=oe.getPrimaries(oe.workingColorSpace),at=_.colorSpace===_i?null:oe.getPrimaries(_.colorSpace),Mt=_.colorSpace===_i||ot===at?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Mt);let lt=x(_.image,!1,s.maxTextureSize);lt=z(_,lt);let gt=r.convert(_.format,_.colorSpace),ut=r.convert(_.type),Tt=E(_.internalFormat,gt,ut,_.colorSpace,_.isVideoTexture);wt(B,_);let dt,zt=_.mipmaps,Bt=_.isVideoTexture!==!0,se=pt.__version===void 0||H===!0,M=Y.dataReady,L=V(_,lt);if(_.isDepthTexture)Tt=S(_.format===Ts,_.type),se&&(Bt?e.texStorage2D(i.TEXTURE_2D,1,Tt,lt.width,lt.height):e.texImage2D(i.TEXTURE_2D,0,Tt,lt.width,lt.height,0,gt,ut,null));else if(_.isDataTexture)if(zt.length>0){Bt&&se&&e.texStorage2D(i.TEXTURE_2D,L,Tt,zt[0].width,zt[0].height);for(let N=0,P=zt.length;N<P;N++)dt=zt[N],Bt?M&&e.texSubImage2D(i.TEXTURE_2D,N,0,0,dt.width,dt.height,gt,ut,dt.data):e.texImage2D(i.TEXTURE_2D,N,Tt,dt.width,dt.height,0,gt,ut,dt.data);_.generateMipmaps=!1}else Bt?(se&&e.texStorage2D(i.TEXTURE_2D,L,Tt,lt.width,lt.height),M&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,lt.width,lt.height,gt,ut,lt.data)):e.texImage2D(i.TEXTURE_2D,0,Tt,lt.width,lt.height,0,gt,ut,lt.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Bt&&se&&e.texStorage3D(i.TEXTURE_2D_ARRAY,L,Tt,zt[0].width,zt[0].height,lt.depth);for(let N=0,P=zt.length;N<P;N++)if(dt=zt[N],_.format!==gn)if(gt!==null)if(Bt){if(M)if(_.layerUpdates.size>0){let $=Xu(dt.width,dt.height,_.format,_.type);for(let j of _.layerUpdates){let vt=dt.data.subarray(j*$/dt.data.BYTES_PER_ELEMENT,(j+1)*$/dt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,N,0,0,j,dt.width,dt.height,1,gt,vt)}_.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,N,0,0,0,dt.width,dt.height,lt.depth,gt,dt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,N,Tt,dt.width,dt.height,lt.depth,0,dt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Bt?M&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,N,0,0,0,dt.width,dt.height,lt.depth,gt,ut,dt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,N,Tt,dt.width,dt.height,lt.depth,0,gt,ut,dt.data)}else{Bt&&se&&e.texStorage2D(i.TEXTURE_2D,L,Tt,zt[0].width,zt[0].height);for(let N=0,P=zt.length;N<P;N++)dt=zt[N],_.format!==gn?gt!==null?Bt?M&&e.compressedTexSubImage2D(i.TEXTURE_2D,N,0,0,dt.width,dt.height,gt,dt.data):e.compressedTexImage2D(i.TEXTURE_2D,N,Tt,dt.width,dt.height,0,dt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Bt?M&&e.texSubImage2D(i.TEXTURE_2D,N,0,0,dt.width,dt.height,gt,ut,dt.data):e.texImage2D(i.TEXTURE_2D,N,Tt,dt.width,dt.height,0,gt,ut,dt.data)}else if(_.isDataArrayTexture)if(Bt){if(se&&e.texStorage3D(i.TEXTURE_2D_ARRAY,L,Tt,lt.width,lt.height,lt.depth),M)if(_.layerUpdates.size>0){let N=Xu(lt.width,lt.height,_.format,_.type);for(let P of _.layerUpdates){let $=lt.data.subarray(P*N/lt.data.BYTES_PER_ELEMENT,(P+1)*N/lt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,P,lt.width,lt.height,1,gt,ut,$)}_.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,lt.width,lt.height,lt.depth,gt,ut,lt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Tt,lt.width,lt.height,lt.depth,0,gt,ut,lt.data);else if(_.isData3DTexture)Bt?(se&&e.texStorage3D(i.TEXTURE_3D,L,Tt,lt.width,lt.height,lt.depth),M&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,lt.width,lt.height,lt.depth,gt,ut,lt.data)):e.texImage3D(i.TEXTURE_3D,0,Tt,lt.width,lt.height,lt.depth,0,gt,ut,lt.data);else if(_.isFramebufferTexture){if(se)if(Bt)e.texStorage2D(i.TEXTURE_2D,L,Tt,lt.width,lt.height);else{let N=lt.width,P=lt.height;for(let $=0;$<L;$++)e.texImage2D(i.TEXTURE_2D,$,Tt,N,P,0,gt,ut,null),N>>=1,P>>=1}}else if(zt.length>0){if(Bt&&se){let N=k(zt[0]);e.texStorage2D(i.TEXTURE_2D,L,Tt,N.width,N.height)}for(let N=0,P=zt.length;N<P;N++)dt=zt[N],Bt?M&&e.texSubImage2D(i.TEXTURE_2D,N,0,0,gt,ut,dt):e.texImage2D(i.TEXTURE_2D,N,Tt,gt,ut,dt);_.generateMipmaps=!1}else if(Bt){if(se){let N=k(lt);e.texStorage2D(i.TEXTURE_2D,L,Tt,N.width,N.height)}M&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,gt,ut,lt)}else e.texImage2D(i.TEXTURE_2D,0,Tt,gt,ut,lt);g(_)&&m(B),pt.__version=Y.version,_.onUpdate&&_.onUpdate(_)}v.__version=_.version}function ht(v,_,U){if(_.image.length!==6)return;let B=Qt(v,_),H=_.source;e.bindTexture(i.TEXTURE_CUBE_MAP,v.__webglTexture,i.TEXTURE0+U);let Y=n.get(H);if(H.version!==Y.__version||B===!0){e.activeTexture(i.TEXTURE0+U);let pt=oe.getPrimaries(oe.workingColorSpace),ot=_.colorSpace===_i?null:oe.getPrimaries(_.colorSpace),at=_.colorSpace===_i||pt===ot?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,at);let Mt=_.isCompressedTexture||_.image[0].isCompressedTexture,lt=_.image[0]&&_.image[0].isDataTexture,gt=[];for(let P=0;P<6;P++)!Mt&&!lt?gt[P]=x(_.image[P],!0,s.maxCubemapSize):gt[P]=lt?_.image[P].image:_.image[P],gt[P]=z(_,gt[P]);let ut=gt[0],Tt=r.convert(_.format,_.colorSpace),dt=r.convert(_.type),zt=E(_.internalFormat,Tt,dt,_.colorSpace),Bt=_.isVideoTexture!==!0,se=Y.__version===void 0||B===!0,M=H.dataReady,L=V(_,ut);wt(i.TEXTURE_CUBE_MAP,_);let N;if(Mt){Bt&&se&&e.texStorage2D(i.TEXTURE_CUBE_MAP,L,zt,ut.width,ut.height);for(let P=0;P<6;P++){N=gt[P].mipmaps;for(let $=0;$<N.length;$++){let j=N[$];_.format!==gn?Tt!==null?Bt?M&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+P,$,0,0,j.width,j.height,Tt,j.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+P,$,zt,j.width,j.height,0,j.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Bt?M&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+P,$,0,0,j.width,j.height,Tt,dt,j.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+P,$,zt,j.width,j.height,0,Tt,dt,j.data)}}}else{if(N=_.mipmaps,Bt&&se){N.length>0&&L++;let P=k(gt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,L,zt,P.width,P.height)}for(let P=0;P<6;P++)if(lt){Bt?M&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+P,0,0,0,gt[P].width,gt[P].height,Tt,dt,gt[P].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+P,0,zt,gt[P].width,gt[P].height,0,Tt,dt,gt[P].data);for(let $=0;$<N.length;$++){let vt=N[$].image[P].image;Bt?M&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+P,$+1,0,0,vt.width,vt.height,Tt,dt,vt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+P,$+1,zt,vt.width,vt.height,0,Tt,dt,vt.data)}}else{Bt?M&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+P,0,0,0,Tt,dt,gt[P]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+P,0,zt,Tt,dt,gt[P]);for(let $=0;$<N.length;$++){let j=N[$];Bt?M&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+P,$+1,0,0,Tt,dt,j.image[P]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+P,$+1,zt,Tt,dt,j.image[P])}}}g(_)&&m(i.TEXTURE_CUBE_MAP),Y.__version=H.version,_.onUpdate&&_.onUpdate(_)}v.__version=_.version}function Et(v,_,U,B,H,Y){let pt=r.convert(U.format,U.colorSpace),ot=r.convert(U.type),at=E(U.internalFormat,pt,ot,U.colorSpace),Mt=n.get(_),lt=n.get(U);if(lt.__renderTarget=_,!Mt.__hasExternalTextures){let gt=Math.max(1,_.width>>Y),ut=Math.max(1,_.height>>Y);H===i.TEXTURE_3D||H===i.TEXTURE_2D_ARRAY?e.texImage3D(H,Y,at,gt,ut,_.depth,0,pt,ot,null):e.texImage2D(H,Y,at,gt,ut,0,pt,ot,null)}e.bindFramebuffer(i.FRAMEBUFFER,v),Jt(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,B,H,lt.__webglTexture,0,Rt(_)):(H===i.TEXTURE_2D||H>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&H<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,B,H,lt.__webglTexture,Y),e.bindFramebuffer(i.FRAMEBUFFER,null)}function mt(v,_,U){if(i.bindRenderbuffer(i.RENDERBUFFER,v),_.depthBuffer){let B=_.depthTexture,H=B&&B.isDepthTexture?B.type:null,Y=S(_.stencilBuffer,H),pt=_.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ot=Rt(_);Jt(_)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ot,Y,_.width,_.height):U?i.renderbufferStorageMultisample(i.RENDERBUFFER,ot,Y,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,Y,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,pt,i.RENDERBUFFER,v)}else{let B=_.textures;for(let H=0;H<B.length;H++){let Y=B[H],pt=r.convert(Y.format,Y.colorSpace),ot=r.convert(Y.type),at=E(Y.internalFormat,pt,ot,Y.colorSpace),Mt=Rt(_);U&&Jt(_)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Mt,at,_.width,_.height):Jt(_)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Mt,at,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,at,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Vt(v,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,v),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let B=n.get(_.depthTexture);B.__renderTarget=_,(!B.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),rt(_.depthTexture,0);let H=B.__webglTexture,Y=Rt(_);if(_.depthTexture.format===vs)Jt(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,H,0,Y):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,H,0);else if(_.depthTexture.format===Ts)Jt(_)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,H,0,Y):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,H,0);else throw new Error("Unknown depthTexture format")}function Gt(v){let _=n.get(v),U=v.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==v.depthTexture){let B=v.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),B){let H=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,B.removeEventListener("dispose",H)};B.addEventListener("dispose",H),_.__depthDisposeCallback=H}_.__boundDepthTexture=B}if(v.depthTexture&&!_.__autoAllocateDepthBuffer){if(U)throw new Error("target.depthTexture not supported in Cube render targets");Vt(_.__webglFramebuffer,v)}else if(U){_.__webglDepthbuffer=[];for(let B=0;B<6;B++)if(e.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[B]),_.__webglDepthbuffer[B]===void 0)_.__webglDepthbuffer[B]=i.createRenderbuffer(),mt(_.__webglDepthbuffer[B],v,!1);else{let H=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Y=_.__webglDepthbuffer[B];i.bindRenderbuffer(i.RENDERBUFFER,Y),i.framebufferRenderbuffer(i.FRAMEBUFFER,H,i.RENDERBUFFER,Y)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=i.createRenderbuffer(),mt(_.__webglDepthbuffer,v,!1);else{let B=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,H=_.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,H),i.framebufferRenderbuffer(i.FRAMEBUFFER,B,i.RENDERBUFFER,H)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Zt(v,_,U){let B=n.get(v);_!==void 0&&Et(B.__webglFramebuffer,v,v.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),U!==void 0&&Gt(v)}function fe(v){let _=v.texture,U=n.get(v),B=n.get(_);v.addEventListener("dispose",y);let H=v.textures,Y=v.isWebGLCubeRenderTarget===!0,pt=H.length>1;if(pt||(B.__webglTexture===void 0&&(B.__webglTexture=i.createTexture()),B.__version=_.version,o.memory.textures++),Y){U.__webglFramebuffer=[];for(let ot=0;ot<6;ot++)if(_.mipmaps&&_.mipmaps.length>0){U.__webglFramebuffer[ot]=[];for(let at=0;at<_.mipmaps.length;at++)U.__webglFramebuffer[ot][at]=i.createFramebuffer()}else U.__webglFramebuffer[ot]=i.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){U.__webglFramebuffer=[];for(let ot=0;ot<_.mipmaps.length;ot++)U.__webglFramebuffer[ot]=i.createFramebuffer()}else U.__webglFramebuffer=i.createFramebuffer();if(pt)for(let ot=0,at=H.length;ot<at;ot++){let Mt=n.get(H[ot]);Mt.__webglTexture===void 0&&(Mt.__webglTexture=i.createTexture(),o.memory.textures++)}if(v.samples>0&&Jt(v)===!1){U.__webglMultisampledFramebuffer=i.createFramebuffer(),U.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,U.__webglMultisampledFramebuffer);for(let ot=0;ot<H.length;ot++){let at=H[ot];U.__webglColorRenderbuffer[ot]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,U.__webglColorRenderbuffer[ot]);let Mt=r.convert(at.format,at.colorSpace),lt=r.convert(at.type),gt=E(at.internalFormat,Mt,lt,at.colorSpace,v.isXRRenderTarget===!0),ut=Rt(v);i.renderbufferStorageMultisample(i.RENDERBUFFER,ut,gt,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ot,i.RENDERBUFFER,U.__webglColorRenderbuffer[ot])}i.bindRenderbuffer(i.RENDERBUFFER,null),v.depthBuffer&&(U.__webglDepthRenderbuffer=i.createRenderbuffer(),mt(U.__webglDepthRenderbuffer,v,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Y){e.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture),wt(i.TEXTURE_CUBE_MAP,_);for(let ot=0;ot<6;ot++)if(_.mipmaps&&_.mipmaps.length>0)for(let at=0;at<_.mipmaps.length;at++)Et(U.__webglFramebuffer[ot][at],v,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ot,at);else Et(U.__webglFramebuffer[ot],v,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ot,0);g(_)&&m(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(pt){for(let ot=0,at=H.length;ot<at;ot++){let Mt=H[ot],lt=n.get(Mt);e.bindTexture(i.TEXTURE_2D,lt.__webglTexture),wt(i.TEXTURE_2D,Mt),Et(U.__webglFramebuffer,v,Mt,i.COLOR_ATTACHMENT0+ot,i.TEXTURE_2D,0),g(Mt)&&m(i.TEXTURE_2D)}e.unbindTexture()}else{let ot=i.TEXTURE_2D;if((v.isWebGL3DRenderTarget||v.isWebGLArrayRenderTarget)&&(ot=v.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ot,B.__webglTexture),wt(ot,_),_.mipmaps&&_.mipmaps.length>0)for(let at=0;at<_.mipmaps.length;at++)Et(U.__webglFramebuffer[at],v,_,i.COLOR_ATTACHMENT0,ot,at);else Et(U.__webglFramebuffer,v,_,i.COLOR_ATTACHMENT0,ot,0);g(_)&&m(ot),e.unbindTexture()}v.depthBuffer&&Gt(v)}function Dt(v){let _=v.textures;for(let U=0,B=_.length;U<B;U++){let H=_[U];if(g(H)){let Y=w(v),pt=n.get(H).__webglTexture;e.bindTexture(Y,pt),m(Y),e.unbindTexture()}}}let pe=[],F=[];function Ie(v){if(v.samples>0){if(Jt(v)===!1){let _=v.textures,U=v.width,B=v.height,H=i.COLOR_BUFFER_BIT,Y=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,pt=n.get(v),ot=_.length>1;if(ot)for(let at=0;at<_.length;at++)e.bindFramebuffer(i.FRAMEBUFFER,pt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+at,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,pt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+at,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,pt.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,pt.__webglFramebuffer);for(let at=0;at<_.length;at++){if(v.resolveDepthBuffer&&(v.depthBuffer&&(H|=i.DEPTH_BUFFER_BIT),v.stencilBuffer&&v.resolveStencilBuffer&&(H|=i.STENCIL_BUFFER_BIT)),ot){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,pt.__webglColorRenderbuffer[at]);let Mt=n.get(_[at]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Mt,0)}i.blitFramebuffer(0,0,U,B,0,0,U,B,H,i.NEAREST),c===!0&&(pe.length=0,F.length=0,pe.push(i.COLOR_ATTACHMENT0+at),v.depthBuffer&&v.resolveDepthBuffer===!1&&(pe.push(Y),F.push(Y),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,F)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,pe))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ot)for(let at=0;at<_.length;at++){e.bindFramebuffer(i.FRAMEBUFFER,pt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+at,i.RENDERBUFFER,pt.__webglColorRenderbuffer[at]);let Mt=n.get(_[at]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,pt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+at,i.TEXTURE_2D,Mt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,pt.__webglMultisampledFramebuffer)}else if(v.depthBuffer&&v.resolveDepthBuffer===!1&&c){let _=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[_])}}}function Rt(v){return Math.min(s.maxSamples,v.samples)}function Jt(v){let _=n.get(v);return v.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function C(v){let _=o.render.frame;l.get(v)!==_&&(l.set(v,_),v.update())}function z(v,_){let U=v.colorSpace,B=v.format,H=v.type;return v.isCompressedTexture===!0||v.isVideoTexture===!0||U!==zs&&U!==_i&&(oe.getTransfer(U)===_e?(B!==gn||H!==ei)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",U)),_}function k(v){return typeof HTMLImageElement<"u"&&v instanceof HTMLImageElement?(h.width=v.naturalWidth||v.width,h.height=v.naturalHeight||v.height):typeof VideoFrame<"u"&&v instanceof VideoFrame?(h.width=v.displayWidth,h.height=v.displayHeight):(h.width=v.width,h.height=v.height),h}this.allocateTextureUnit=Z,this.resetTextureUnits=W,this.setTexture2D=rt,this.setTexture2DArray=K,this.setTexture3D=ct,this.setTextureCube=tt,this.rebindTextures=Zt,this.setupRenderTarget=fe,this.updateRenderTargetMipmap=Dt,this.updateMultisampleRenderTarget=Ie,this.setupDepthRenderbuffer=Gt,this.setupFrameBufferTexture=Et,this.useMultisampledRTT=Jt}function h_(i,t){function e(n,s=_i){let r,o=oe.getTransfer(s);if(n===ei)return i.UNSIGNED_BYTE;if(n===$c)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Jc)return i.UNSIGNED_SHORT_5_5_5_1;if(n===xd)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===md)return i.BYTE;if(n===gd)return i.SHORT;if(n===mr)return i.UNSIGNED_SHORT;if(n===Zc)return i.INT;if(n===ni)return i.UNSIGNED_INT;if(n===Cn)return i.FLOAT;if(n===oi)return i.HALF_FLOAT;if(n===_d)return i.ALPHA;if(n===vd)return i.RGB;if(n===gn)return i.RGBA;if(n===yd)return i.LUMINANCE;if(n===Md)return i.LUMINANCE_ALPHA;if(n===vs)return i.DEPTH_COMPONENT;if(n===Ts)return i.DEPTH_STENCIL;if(n===Kc)return i.RED;if(n===jc)return i.RED_INTEGER;if(n===bd)return i.RG;if(n===Qc)return i.RG_INTEGER;if(n===th)return i.RGBA_INTEGER;if(n===wo||n===Eo||n===To||n===Ao)if(o===_e)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===wo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Eo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===To)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ao)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===wo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Eo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===To)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ao)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ol||n===kl||n===zl||n===Bl)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ol)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===kl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===zl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Bl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Hl||n===Vl||n===Gl)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Hl||n===Vl)return o===_e?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Gl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Wl||n===Xl||n===ql||n===Yl||n===Zl||n===$l||n===Jl||n===Kl||n===jl||n===Ql||n===tc||n===ec||n===nc||n===ic)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Wl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Xl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===ql)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Yl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Zl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===$l)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Jl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Kl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===jl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ql)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===tc)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ec)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===nc)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ic)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ro||n===sc||n===rc)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Ro)return o===_e?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===sc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===rc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Sd||n===oc||n===ac||n===lc)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ro)return r.COMPRESSED_RED_RGTC1_EXT;if(n===oc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ac)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===lc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Es?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var Sc=class extends Be{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}},ie=class extends ze{constructor(){super(),this.isGroup=!0,this.type="Group"}},u_={type:"move"},ur=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ie,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ie,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ie,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null,a=this._targetRay,c=this._grip,h=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(h&&t.hand){o=!0;for(let x of t.hand.values()){let g=e.getJointPose(x,n),m=this._getHandJoint(h,x);g!==null&&(m.matrix.fromArray(g.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=g.radius),m.visible=g!==null}let l=h.joints["index-finger-tip"],u=h.joints["thumb-tip"],d=l.position.distanceTo(u.position),f=.02,p=.005;h.inputState.pinching&&d>f+p?(h.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!h.inputState.pinching&&d<=f-p&&(h.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(u_)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),h!==null&&(h.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new ie;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},d_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,f_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,wc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){let s=new We,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new _n({vertexShader:d_,fragmentShader:f_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new qt(new vn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Ec=class extends kn{constructor(t,e){super();let n=this,s=null,r=1,o=null,a="local-floor",c=1,h=null,l=null,u=null,d=null,f=null,p=null,x=new wc,g=e.getContextAttributes(),m=null,w=null,E=[],S=[],V=new yt,O=null,y=new Be;y.viewport=new ce;let R=new Be;R.viewport=new ce;let A=[y,R],b=new Sc,D=null,W=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(st){let ht=E[st];return ht===void 0&&(ht=new ur,E[st]=ht),ht.getTargetRaySpace()},this.getControllerGrip=function(st){let ht=E[st];return ht===void 0&&(ht=new ur,E[st]=ht),ht.getGripSpace()},this.getHand=function(st){let ht=E[st];return ht===void 0&&(ht=new ur,E[st]=ht),ht.getHandSpace()};function Z(st){let ht=S.indexOf(st.inputSource);if(ht===-1)return;let Et=E[ht];Et!==void 0&&(Et.update(st.inputSource,st.frame,h||o),Et.dispatchEvent({type:st.type,data:st.inputSource}))}function J(){s.removeEventListener("select",Z),s.removeEventListener("selectstart",Z),s.removeEventListener("selectend",Z),s.removeEventListener("squeeze",Z),s.removeEventListener("squeezestart",Z),s.removeEventListener("squeezeend",Z),s.removeEventListener("end",J),s.removeEventListener("inputsourceschange",rt);for(let st=0;st<E.length;st++){let ht=S[st];ht!==null&&(S[st]=null,E[st].disconnect(ht))}D=null,W=null,x.reset(),t.setRenderTarget(m),f=null,d=null,u=null,s=null,w=null,Qt.stop(),n.isPresenting=!1,t.setPixelRatio(O),t.setSize(V.width,V.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(st){r=st,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(st){a=st,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return h||o},this.setReferenceSpace=function(st){h=st},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u},this.getFrame=function(){return p},this.getSession=function(){return s},this.setSession=async function(st){if(s=st,s!==null){if(m=t.getRenderTarget(),s.addEventListener("select",Z),s.addEventListener("selectstart",Z),s.addEventListener("selectend",Z),s.addEventListener("squeeze",Z),s.addEventListener("squeezestart",Z),s.addEventListener("squeezeend",Z),s.addEventListener("end",J),s.addEventListener("inputsourceschange",rt),g.xrCompatible!==!0&&await e.makeXRCompatible(),O=t.getPixelRatio(),t.getSize(V),s.renderState.layers===void 0){let ht={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,ht),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),w=new je(f.framebufferWidth,f.framebufferHeight,{format:gn,type:ei,colorSpace:t.outputColorSpace,stencilBuffer:g.stencil})}else{let ht=null,Et=null,mt=null;g.depth&&(mt=g.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,ht=g.stencil?Ts:vs,Et=g.stencil?Es:ni);let Vt={colorFormat:e.RGBA8,depthFormat:mt,scaleFactor:r};u=new XRWebGLBinding(s,e),d=u.createProjectionLayer(Vt),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),w=new je(d.textureWidth,d.textureHeight,{format:gn,type:ei,depthTexture:new Is(d.textureWidth,d.textureHeight,Et,void 0,void 0,void 0,void 0,void 0,void 0,ht),stencilBuffer:g.stencil,colorSpace:t.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1})}w.isXRRenderTarget=!0,this.setFoveation(c),h=null,o=await s.requestReferenceSpace(a),Qt.setContext(s),Qt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function rt(st){for(let ht=0;ht<st.removed.length;ht++){let Et=st.removed[ht],mt=S.indexOf(Et);mt>=0&&(S[mt]=null,E[mt].disconnect(Et))}for(let ht=0;ht<st.added.length;ht++){let Et=st.added[ht],mt=S.indexOf(Et);if(mt===-1){for(let Gt=0;Gt<E.length;Gt++)if(Gt>=S.length){S.push(Et),mt=Gt;break}else if(S[Gt]===null){S[Gt]=Et,mt=Gt;break}if(mt===-1)break}let Vt=E[mt];Vt&&Vt.connect(Et)}}let K=new I,ct=new I;function tt(st,ht,Et){K.setFromMatrixPosition(ht.matrixWorld),ct.setFromMatrixPosition(Et.matrixWorld);let mt=K.distanceTo(ct),Vt=ht.projectionMatrix.elements,Gt=Et.projectionMatrix.elements,Zt=Vt[14]/(Vt[10]-1),fe=Vt[14]/(Vt[10]+1),Dt=(Vt[9]+1)/Vt[5],pe=(Vt[9]-1)/Vt[5],F=(Vt[8]-1)/Vt[0],Ie=(Gt[8]+1)/Gt[0],Rt=Zt*F,Jt=Zt*Ie,C=mt/(-F+Ie),z=C*-F;if(ht.matrixWorld.decompose(st.position,st.quaternion,st.scale),st.translateX(z),st.translateZ(C),st.matrixWorld.compose(st.position,st.quaternion,st.scale),st.matrixWorldInverse.copy(st.matrixWorld).invert(),Vt[10]===-1)st.projectionMatrix.copy(ht.projectionMatrix),st.projectionMatrixInverse.copy(ht.projectionMatrixInverse);else{let k=Zt+C,v=fe+C,_=Rt-z,U=Jt+(mt-z),B=Dt*fe/v*k,H=pe*fe/v*k;st.projectionMatrix.makePerspective(_,U,B,H,k,v),st.projectionMatrixInverse.copy(st.projectionMatrix).invert()}}function et(st,ht){ht===null?st.matrixWorld.copy(st.matrix):st.matrixWorld.multiplyMatrices(ht.matrixWorld,st.matrix),st.matrixWorldInverse.copy(st.matrixWorld).invert()}this.updateCamera=function(st){if(s===null)return;let ht=st.near,Et=st.far;x.texture!==null&&(x.depthNear>0&&(ht=x.depthNear),x.depthFar>0&&(Et=x.depthFar)),b.near=R.near=y.near=ht,b.far=R.far=y.far=Et,(D!==b.near||W!==b.far)&&(s.updateRenderState({depthNear:b.near,depthFar:b.far}),D=b.near,W=b.far),y.layers.mask=st.layers.mask|2,R.layers.mask=st.layers.mask|4,b.layers.mask=y.layers.mask|R.layers.mask;let mt=st.parent,Vt=b.cameras;et(b,mt);for(let Gt=0;Gt<Vt.length;Gt++)et(Vt[Gt],mt);Vt.length===2?tt(b,y,R):b.projectionMatrix.copy(y.projectionMatrix),_t(st,b,mt)};function _t(st,ht,Et){Et===null?st.matrix.copy(ht.matrixWorld):(st.matrix.copy(Et.matrixWorld),st.matrix.invert(),st.matrix.multiply(ht.matrixWorld)),st.matrix.decompose(st.position,st.quaternion,st.scale),st.updateMatrixWorld(!0),st.projectionMatrix.copy(ht.projectionMatrix),st.projectionMatrixInverse.copy(ht.projectionMatrixInverse),st.isPerspectiveCamera&&(st.fov=As*2*Math.atan(1/st.projectionMatrix.elements[5]),st.zoom=1)}this.getCamera=function(){return b},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function(st){c=st,d!==null&&(d.fixedFoveation=st),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=st)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(b)};let It=null;function wt(st,ht){if(l=ht.getViewerPose(h||o),p=ht,l!==null){let Et=l.views;f!==null&&(t.setRenderTargetFramebuffer(w,f.framebuffer),t.setRenderTarget(w));let mt=!1;Et.length!==b.cameras.length&&(b.cameras.length=0,mt=!0);for(let Gt=0;Gt<Et.length;Gt++){let Zt=Et[Gt],fe=null;if(f!==null)fe=f.getViewport(Zt);else{let pe=u.getViewSubImage(d,Zt);fe=pe.viewport,Gt===0&&(t.setRenderTargetTextures(w,pe.colorTexture,d.ignoreDepthValues?void 0:pe.depthStencilTexture),t.setRenderTarget(w))}let Dt=A[Gt];Dt===void 0&&(Dt=new Be,Dt.layers.enable(Gt),Dt.viewport=new ce,A[Gt]=Dt),Dt.matrix.fromArray(Zt.transform.matrix),Dt.matrix.decompose(Dt.position,Dt.quaternion,Dt.scale),Dt.projectionMatrix.fromArray(Zt.projectionMatrix),Dt.projectionMatrixInverse.copy(Dt.projectionMatrix).invert(),Dt.viewport.set(fe.x,fe.y,fe.width,fe.height),Gt===0&&(b.matrix.copy(Dt.matrix),b.matrix.decompose(b.position,b.quaternion,b.scale)),mt===!0&&b.cameras.push(Dt)}let Vt=s.enabledFeatures;if(Vt&&Vt.includes("depth-sensing")){let Gt=u.getDepthInformation(Et[0]);Gt&&Gt.isValid&&Gt.texture&&x.init(t,Gt,s.renderState)}}for(let Et=0;Et<E.length;Et++){let mt=S[Et],Vt=E[Et];mt!==null&&Vt!==void 0&&Vt.update(mt,ht,h||o)}It&&It(st,ht),ht.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ht}),p=null}let Qt=new Cd;Qt.setAnimationLoop(wt),this.setAnimationLoop=function(st){It=st},this.dispose=function(){}}},Oi=new zn,p_=new Yt;function m_(i,t){function e(g,m){g.matrixAutoUpdate===!0&&g.updateMatrix(),m.value.copy(g.matrix)}function n(g,m){m.color.getRGB(g.fogColor.value,Rd(i)),m.isFog?(g.fogNear.value=m.near,g.fogFar.value=m.far):m.isFogExp2&&(g.fogDensity.value=m.density)}function s(g,m,w,E,S){m.isMeshBasicMaterial||m.isMeshLambertMaterial?r(g,m):m.isMeshToonMaterial?(r(g,m),u(g,m)):m.isMeshPhongMaterial?(r(g,m),l(g,m)):m.isMeshStandardMaterial?(r(g,m),d(g,m),m.isMeshPhysicalMaterial&&f(g,m,S)):m.isMeshMatcapMaterial?(r(g,m),p(g,m)):m.isMeshDepthMaterial?r(g,m):m.isMeshDistanceMaterial?(r(g,m),x(g,m)):m.isMeshNormalMaterial?r(g,m):m.isLineBasicMaterial?(o(g,m),m.isLineDashedMaterial&&a(g,m)):m.isPointsMaterial?c(g,m,w,E):m.isSpriteMaterial?h(g,m):m.isShadowMaterial?(g.color.value.copy(m.color),g.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(g,m){g.opacity.value=m.opacity,m.color&&g.diffuse.value.copy(m.color),m.emissive&&g.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(g.map.value=m.map,e(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,e(m.alphaMap,g.alphaMapTransform)),m.bumpMap&&(g.bumpMap.value=m.bumpMap,e(m.bumpMap,g.bumpMapTransform),g.bumpScale.value=m.bumpScale,m.side===Ge&&(g.bumpScale.value*=-1)),m.normalMap&&(g.normalMap.value=m.normalMap,e(m.normalMap,g.normalMapTransform),g.normalScale.value.copy(m.normalScale),m.side===Ge&&g.normalScale.value.negate()),m.displacementMap&&(g.displacementMap.value=m.displacementMap,e(m.displacementMap,g.displacementMapTransform),g.displacementScale.value=m.displacementScale,g.displacementBias.value=m.displacementBias),m.emissiveMap&&(g.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,g.emissiveMapTransform)),m.specularMap&&(g.specularMap.value=m.specularMap,e(m.specularMap,g.specularMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest);let w=t.get(m),E=w.envMap,S=w.envMapRotation;E&&(g.envMap.value=E,Oi.copy(S),Oi.x*=-1,Oi.y*=-1,Oi.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(Oi.y*=-1,Oi.z*=-1),g.envMapRotation.value.setFromMatrix4(p_.makeRotationFromEuler(Oi)),g.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=m.reflectivity,g.ior.value=m.ior,g.refractionRatio.value=m.refractionRatio),m.lightMap&&(g.lightMap.value=m.lightMap,g.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,g.lightMapTransform)),m.aoMap&&(g.aoMap.value=m.aoMap,g.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,g.aoMapTransform))}function o(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,m.map&&(g.map.value=m.map,e(m.map,g.mapTransform))}function a(g,m){g.dashSize.value=m.dashSize,g.totalSize.value=m.dashSize+m.gapSize,g.scale.value=m.scale}function c(g,m,w,E){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.size.value=m.size*w,g.scale.value=E*.5,m.map&&(g.map.value=m.map,e(m.map,g.uvTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,e(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function h(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.rotation.value=m.rotation,m.map&&(g.map.value=m.map,e(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,e(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function l(g,m){g.specular.value.copy(m.specular),g.shininess.value=Math.max(m.shininess,1e-4)}function u(g,m){m.gradientMap&&(g.gradientMap.value=m.gradientMap)}function d(g,m){g.metalness.value=m.metalness,m.metalnessMap&&(g.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,g.metalnessMapTransform)),g.roughness.value=m.roughness,m.roughnessMap&&(g.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,g.roughnessMapTransform)),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)}function f(g,m,w){g.ior.value=m.ior,m.sheen>0&&(g.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),g.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(g.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,g.sheenColorMapTransform)),m.sheenRoughnessMap&&(g.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,g.sheenRoughnessMapTransform))),m.clearcoat>0&&(g.clearcoat.value=m.clearcoat,g.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(g.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,g.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(g.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Ge&&g.clearcoatNormalScale.value.negate())),m.dispersion>0&&(g.dispersion.value=m.dispersion),m.iridescence>0&&(g.iridescence.value=m.iridescence,g.iridescenceIOR.value=m.iridescenceIOR,g.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(g.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,g.iridescenceMapTransform)),m.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),m.transmission>0&&(g.transmission.value=m.transmission,g.transmissionSamplerMap.value=w.texture,g.transmissionSamplerSize.value.set(w.width,w.height),m.transmissionMap&&(g.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,g.transmissionMapTransform)),g.thickness.value=m.thickness,m.thicknessMap&&(g.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=m.attenuationDistance,g.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(g.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(g.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=m.specularIntensity,g.specularColor.value.copy(m.specularColor),m.specularColorMap&&(g.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,g.specularColorMapTransform)),m.specularIntensityMap&&(g.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,g.specularIntensityMapTransform))}function p(g,m){m.matcap&&(g.matcap.value=m.matcap)}function x(g,m){let w=t.get(m).light;g.referencePosition.value.setFromMatrixPosition(w.matrixWorld),g.nearDistance.value=w.shadow.camera.near,g.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function g_(i,t,e,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(w,E){let S=E.program;n.uniformBlockBinding(w,S)}function h(w,E){let S=s[w.id];S===void 0&&(p(w),S=l(w),s[w.id]=S,w.addEventListener("dispose",g));let V=E.program;n.updateUBOMapping(w,V);let O=t.render.frame;r[w.id]!==O&&(d(w),r[w.id]=O)}function l(w){let E=u();w.__bindingPointIndex=E;let S=i.createBuffer(),V=w.__size,O=w.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,V,O),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,S),S}function u(){for(let w=0;w<a;w++)if(o.indexOf(w)===-1)return o.push(w),w;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(w){let E=s[w.id],S=w.uniforms,V=w.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let O=0,y=S.length;O<y;O++){let R=Array.isArray(S[O])?S[O]:[S[O]];for(let A=0,b=R.length;A<b;A++){let D=R[A];if(f(D,O,A,V)===!0){let W=D.__offset,Z=Array.isArray(D.value)?D.value:[D.value],J=0;for(let rt=0;rt<Z.length;rt++){let K=Z[rt],ct=x(K);typeof K=="number"||typeof K=="boolean"?(D.__data[0]=K,i.bufferSubData(i.UNIFORM_BUFFER,W+J,D.__data)):K.isMatrix3?(D.__data[0]=K.elements[0],D.__data[1]=K.elements[1],D.__data[2]=K.elements[2],D.__data[3]=0,D.__data[4]=K.elements[3],D.__data[5]=K.elements[4],D.__data[6]=K.elements[5],D.__data[7]=0,D.__data[8]=K.elements[6],D.__data[9]=K.elements[7],D.__data[10]=K.elements[8],D.__data[11]=0):(K.toArray(D.__data,J),J+=ct.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,W,D.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(w,E,S,V){let O=w.value,y=E+"_"+S;if(V[y]===void 0)return typeof O=="number"||typeof O=="boolean"?V[y]=O:V[y]=O.clone(),!0;{let R=V[y];if(typeof O=="number"||typeof O=="boolean"){if(R!==O)return V[y]=O,!0}else if(R.equals(O)===!1)return R.copy(O),!0}return!1}function p(w){let E=w.uniforms,S=0,V=16;for(let y=0,R=E.length;y<R;y++){let A=Array.isArray(E[y])?E[y]:[E[y]];for(let b=0,D=A.length;b<D;b++){let W=A[b],Z=Array.isArray(W.value)?W.value:[W.value];for(let J=0,rt=Z.length;J<rt;J++){let K=Z[J],ct=x(K),tt=S%V,et=tt%ct.boundary,_t=tt+et;S+=et,_t!==0&&V-_t<ct.storage&&(S+=V-_t),W.__data=new Float32Array(ct.storage/Float32Array.BYTES_PER_ELEMENT),W.__offset=S,S+=ct.storage}}}let O=S%V;return O>0&&(S+=V-O),w.__size=S,w.__cache={},this}function x(w){let E={boundary:0,storage:0};return typeof w=="number"||typeof w=="boolean"?(E.boundary=4,E.storage=4):w.isVector2?(E.boundary=8,E.storage=8):w.isVector3||w.isColor?(E.boundary=16,E.storage=12):w.isVector4?(E.boundary=16,E.storage=16):w.isMatrix3?(E.boundary=48,E.storage=48):w.isMatrix4?(E.boundary=64,E.storage=64):w.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",w),E}function g(w){let E=w.target;E.removeEventListener("dispose",g);let S=o.indexOf(E.__bindingPointIndex);o.splice(S,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function m(){for(let w in s)i.deleteBuffer(s[w]);o=[],s={},r={}}return{bind:c,update:h,dispose:m}}var Bo=class{constructor(t={}){let{canvas:e=yp(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:h=!1,powerPreference:l="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:d=!1}=t;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;let p=new Uint32Array(4),x=new Int32Array(4),g=null,m=null,w=[],E=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Pe,this.toneMapping=yi,this.toneMappingExposure=1;let S=this,V=!1,O=0,y=0,R=null,A=-1,b=null,D=new ce,W=new ce,Z=null,J=new Wt(0),rt=0,K=e.width,ct=e.height,tt=1,et=null,_t=null,It=new ce(0,0,K,ct),wt=new ce(0,0,K,ct),Qt=!1,st=new xr,ht=!1,Et=!1,mt=new Yt,Vt=new Yt,Gt=new I,Zt=new ce,fe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Dt=!1;function pe(){return R===null?tt:1}let F=n;function Ie(T,X){return e.getContext(T,X)}try{let T={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:h,powerPreference:l,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine","three.js r170"),e.addEventListener("webglcontextlost",P,!1),e.addEventListener("webglcontextrestored",$,!1),e.addEventListener("webglcontextcreationerror",j,!1),F===null){let X="webgl2";if(F=Ie(X,T),F===null)throw Ie(X)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(T){throw console.error("THREE.WebGLRenderer: "+T.message),T}let Rt,Jt,C,z,k,v,_,U,B,H,Y,pt,ot,at,Mt,lt,gt,ut,Tt,dt,zt,Bt,se,M;function L(){Rt=new Dg(F),Rt.init(),Bt=new h_(F,Rt),Jt=new Tg(F,Rt,t,Bt),C=new a_(F,Rt),Jt.reverseDepthBuffer&&d&&C.buffers.depth.setReversed(!0),z=new Ng(F),k=new Zx,v=new c_(F,Rt,C,k,Jt,Bt,z),_=new Rg(S),U=new Ig(S),B=new Vp(F),se=new wg(F,B),H=new Lg(F,B,z,se),Y=new Og(F,H,B,z),Tt=new Fg(F,Jt,v),lt=new Ag(k),pt=new Yx(S,_,U,Rt,Jt,se,lt),ot=new m_(S,k),at=new Jx,Mt=new n_(Rt),ut=new Sg(S,_,U,C,Y,f,c),gt=new r_(S,Y,Jt),M=new g_(F,z,Jt,C),dt=new Eg(F,Rt,z),zt=new Ug(F,Rt,z),z.programs=pt.programs,S.capabilities=Jt,S.extensions=Rt,S.properties=k,S.renderLists=at,S.shadowMap=gt,S.state=C,S.info=z}L();let N=new Ec(S,F);this.xr=N,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){let T=Rt.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=Rt.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return tt},this.setPixelRatio=function(T){T!==void 0&&(tt=T,this.setSize(K,ct,!1))},this.getSize=function(T){return T.set(K,ct)},this.setSize=function(T,X,nt=!0){if(N.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}K=T,ct=X,e.width=Math.floor(T*tt),e.height=Math.floor(X*tt),nt===!0&&(e.style.width=T+"px",e.style.height=X+"px"),this.setViewport(0,0,T,X)},this.getDrawingBufferSize=function(T){return T.set(K*tt,ct*tt).floor()},this.setDrawingBufferSize=function(T,X,nt){K=T,ct=X,tt=nt,e.width=Math.floor(T*nt),e.height=Math.floor(X*nt),this.setViewport(0,0,T,X)},this.getCurrentViewport=function(T){return T.copy(D)},this.getViewport=function(T){return T.copy(It)},this.setViewport=function(T,X,nt,it){T.isVector4?It.set(T.x,T.y,T.z,T.w):It.set(T,X,nt,it),C.viewport(D.copy(It).multiplyScalar(tt).round())},this.getScissor=function(T){return T.copy(wt)},this.setScissor=function(T,X,nt,it){T.isVector4?wt.set(T.x,T.y,T.z,T.w):wt.set(T,X,nt,it),C.scissor(W.copy(wt).multiplyScalar(tt).round())},this.getScissorTest=function(){return Qt},this.setScissorTest=function(T){C.setScissorTest(Qt=T)},this.setOpaqueSort=function(T){et=T},this.setTransparentSort=function(T){_t=T},this.getClearColor=function(T){return T.copy(ut.getClearColor())},this.setClearColor=function(){ut.setClearColor.apply(ut,arguments)},this.getClearAlpha=function(){return ut.getClearAlpha()},this.setClearAlpha=function(){ut.setClearAlpha.apply(ut,arguments)},this.clear=function(T=!0,X=!0,nt=!0){let it=0;if(T){let q=!1;if(R!==null){let xt=R.texture.format;q=xt===th||xt===Qc||xt===jc}if(q){let xt=R.texture.type,St=xt===ei||xt===ni||xt===mr||xt===Es||xt===$c||xt===Jc,Nt=ut.getClearColor(),Ft=ut.getClearAlpha(),$t=Nt.r,te=Nt.g,Ot=Nt.b;St?(p[0]=$t,p[1]=te,p[2]=Ot,p[3]=Ft,F.clearBufferuiv(F.COLOR,0,p)):(x[0]=$t,x[1]=te,x[2]=Ot,x[3]=Ft,F.clearBufferiv(F.COLOR,0,x))}else it|=F.COLOR_BUFFER_BIT}X&&(it|=F.DEPTH_BUFFER_BIT),nt&&(it|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),F.clear(it)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",P,!1),e.removeEventListener("webglcontextrestored",$,!1),e.removeEventListener("webglcontextcreationerror",j,!1),at.dispose(),Mt.dispose(),k.dispose(),_.dispose(),U.dispose(),Y.dispose(),se.dispose(),M.dispose(),pt.dispose(),N.dispose(),N.removeEventListener("sessionstart",dn),N.removeEventListener("sessionend",fn),on.stop()};function P(T){T.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),V=!0}function $(){console.log("THREE.WebGLRenderer: Context Restored."),V=!1;let T=z.autoReset,X=gt.enabled,nt=gt.autoUpdate,it=gt.needsUpdate,q=gt.type;L(),z.autoReset=T,gt.enabled=X,gt.autoUpdate=nt,gt.needsUpdate=it,gt.type=q}function j(T){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function vt(T){let X=T.target;X.removeEventListener("dispose",vt),Ut(X)}function Ut(T){Xt(T),k.remove(T)}function Xt(T){let X=k.get(T).programs;X!==void 0&&(X.forEach(function(nt){pt.releaseProgram(nt)}),T.isShaderMaterial&&pt.releaseShaderCache(T))}this.renderBufferDirect=function(T,X,nt,it,q,xt){X===null&&(X=fe);let St=q.isMesh&&q.matrixWorld.determinant()<0,Nt=uf(T,X,nt,it,q);C.setMaterial(it,St);let Ft=nt.index,$t=1;if(it.wireframe===!0){if(Ft=H.getWireframeAttribute(nt),Ft===void 0)return;$t=2}let te=nt.drawRange,Ot=nt.attributes.position,ae=te.start*$t,ye=(te.start+te.count)*$t;xt!==null&&(ae=Math.max(ae,xt.start*$t),ye=Math.min(ye,(xt.start+xt.count)*$t)),Ft!==null?(ae=Math.max(ae,0),ye=Math.min(ye,Ft.count)):Ot!=null&&(ae=Math.max(ae,0),ye=Math.min(ye,Ot.count));let Me=ye-ae;if(Me<0||Me===1/0)return;se.setup(q,it,Nt,nt,Ft);let tn,ue=dt;if(Ft!==null&&(tn=B.get(Ft),ue=zt,ue.setIndex(tn)),q.isMesh)it.wireframe===!0?(C.setLineWidth(it.wireframeLinewidth*pe()),ue.setMode(F.LINES)):ue.setMode(F.TRIANGLES);else if(q.isLine){let kt=it.linewidth;kt===void 0&&(kt=1),C.setLineWidth(kt*pe()),q.isLineSegments?ue.setMode(F.LINES):q.isLineLoop?ue.setMode(F.LINE_LOOP):ue.setMode(F.LINE_STRIP)}else q.isPoints?ue.setMode(F.POINTS):q.isSprite&&ue.setMode(F.TRIANGLES);if(q.isBatchedMesh)if(q._multiDrawInstances!==null)ue.renderMultiDrawInstances(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount,q._multiDrawInstances);else if(Rt.get("WEBGL_multi_draw"))ue.renderMultiDraw(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount);else{let kt=q._multiDrawStarts,Xn=q._multiDrawCounts,de=q._multiDrawCount,En=Ft?B.get(Ft).bytesPerElement:1,Ki=k.get(it).currentProgram.getUniforms();for(let an=0;an<de;an++)Ki.setValue(F,"_gl_DrawID",an),ue.render(kt[an]/En,Xn[an])}else if(q.isInstancedMesh)ue.renderInstances(ae,Me,q.count);else if(nt.isInstancedBufferGeometry){let kt=nt._maxInstanceCount!==void 0?nt._maxInstanceCount:1/0,Xn=Math.min(nt.instanceCount,kt);ue.renderInstances(ae,Me,Xn)}else ue.render(ae,Me)};function Ct(T,X,nt){T.transparent===!0&&T.side===Oe&&T.forceSinglePass===!1?(T.side=Ge,T.needsUpdate=!0,$r(T,X,nt),T.side=Mi,T.needsUpdate=!0,$r(T,X,nt),T.side=Oe):$r(T,X,nt)}this.compile=function(T,X,nt=null){nt===null&&(nt=T),m=Mt.get(nt),m.init(X),E.push(m),nt.traverseVisible(function(q){q.isLight&&q.layers.test(X.layers)&&(m.pushLight(q),q.castShadow&&m.pushShadow(q))}),T!==nt&&T.traverseVisible(function(q){q.isLight&&q.layers.test(X.layers)&&(m.pushLight(q),q.castShadow&&m.pushShadow(q))}),m.setupLights();let it=new Set;return T.traverse(function(q){if(!(q.isMesh||q.isPoints||q.isLine||q.isSprite))return;let xt=q.material;if(xt)if(Array.isArray(xt))for(let St=0;St<xt.length;St++){let Nt=xt[St];Ct(Nt,nt,q),it.add(Nt)}else Ct(xt,nt,q),it.add(xt)}),E.pop(),m=null,it},this.compileAsync=function(T,X,nt=null){let it=this.compile(T,X,nt);return new Promise(q=>{function xt(){if(it.forEach(function(St){k.get(St).currentProgram.isReady()&&it.delete(St)}),it.size===0){q(T);return}setTimeout(xt,10)}Rt.get("KHR_parallel_shader_compile")!==null?xt():setTimeout(xt,10)})};let me=null;function Re(T){me&&me(T)}function dn(){on.stop()}function fn(){on.start()}let on=new Cd;on.setAnimationLoop(Re),typeof self<"u"&&on.setContext(self),this.setAnimationLoop=function(T){me=T,N.setAnimationLoop(T),T===null?on.stop():on.start()},N.addEventListener("sessionstart",dn),N.addEventListener("sessionend",fn),this.render=function(T,X){if(X!==void 0&&X.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(V===!0)return;if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),X.parent===null&&X.matrixWorldAutoUpdate===!0&&X.updateMatrixWorld(),N.enabled===!0&&N.isPresenting===!0&&(N.cameraAutoUpdate===!0&&N.updateCamera(X),X=N.getCamera()),T.isScene===!0&&T.onBeforeRender(S,T,X,R),m=Mt.get(T,E.length),m.init(X),E.push(m),Vt.multiplyMatrices(X.projectionMatrix,X.matrixWorldInverse),st.setFromProjectionMatrix(Vt),Et=this.localClippingEnabled,ht=lt.init(this.clippingPlanes,Et),g=at.get(T,w.length),g.init(),w.push(g),N.enabled===!0&&N.isPresenting===!0){let xt=S.xr.getDepthSensingMesh();xt!==null&&Ga(xt,X,-1/0,S.sortObjects)}Ga(T,X,0,S.sortObjects),g.finish(),S.sortObjects===!0&&g.sort(et,_t),Dt=N.enabled===!1||N.isPresenting===!1||N.hasDepthSensing()===!1,Dt&&ut.addToRenderList(g,T),this.info.render.frame++,ht===!0&&lt.beginShadows();let nt=m.state.shadowsArray;gt.render(nt,T,X),ht===!0&&lt.endShadows(),this.info.autoReset===!0&&this.info.reset();let it=g.opaque,q=g.transmissive;if(m.setupLights(),X.isArrayCamera){let xt=X.cameras;if(q.length>0)for(let St=0,Nt=xt.length;St<Nt;St++){let Ft=xt[St];Gh(it,q,T,Ft)}Dt&&ut.render(T);for(let St=0,Nt=xt.length;St<Nt;St++){let Ft=xt[St];Vh(g,T,Ft,Ft.viewport)}}else q.length>0&&Gh(it,q,T,X),Dt&&ut.render(T),Vh(g,T,X);R!==null&&(v.updateMultisampleRenderTarget(R),v.updateRenderTargetMipmap(R)),T.isScene===!0&&T.onAfterRender(S,T,X),se.resetDefaultState(),A=-1,b=null,E.pop(),E.length>0?(m=E[E.length-1],ht===!0&&lt.setGlobalState(S.clippingPlanes,m.state.camera)):m=null,w.pop(),w.length>0?g=w[w.length-1]:g=null};function Ga(T,X,nt,it){if(T.visible===!1)return;if(T.layers.test(X.layers)){if(T.isGroup)nt=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(X);else if(T.isLight)m.pushLight(T),T.castShadow&&m.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||st.intersectsSprite(T)){it&&Zt.setFromMatrixPosition(T.matrixWorld).applyMatrix4(Vt);let St=Y.update(T),Nt=T.material;Nt.visible&&g.push(T,St,Nt,nt,Zt.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||st.intersectsObject(T))){let St=Y.update(T),Nt=T.material;if(it&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Zt.copy(T.boundingSphere.center)):(St.boundingSphere===null&&St.computeBoundingSphere(),Zt.copy(St.boundingSphere.center)),Zt.applyMatrix4(T.matrixWorld).applyMatrix4(Vt)),Array.isArray(Nt)){let Ft=St.groups;for(let $t=0,te=Ft.length;$t<te;$t++){let Ot=Ft[$t],ae=Nt[Ot.materialIndex];ae&&ae.visible&&g.push(T,St,ae,nt,Zt.z,Ot)}}else Nt.visible&&g.push(T,St,Nt,nt,Zt.z,null)}}let xt=T.children;for(let St=0,Nt=xt.length;St<Nt;St++)Ga(xt[St],X,nt,it)}function Vh(T,X,nt,it){let q=T.opaque,xt=T.transmissive,St=T.transparent;m.setupLightsView(nt),ht===!0&&lt.setGlobalState(S.clippingPlanes,nt),it&&C.viewport(D.copy(it)),q.length>0&&Zr(q,X,nt),xt.length>0&&Zr(xt,X,nt),St.length>0&&Zr(St,X,nt),C.buffers.depth.setTest(!0),C.buffers.depth.setMask(!0),C.buffers.color.setMask(!0),C.setPolygonOffset(!1)}function Gh(T,X,nt,it){if((nt.isScene===!0?nt.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[it.id]===void 0&&(m.state.transmissionRenderTarget[it.id]=new je(1,1,{generateMipmaps:!0,type:Rt.has("EXT_color_buffer_half_float")||Rt.has("EXT_color_buffer_float")?oi:ei,minFilter:jn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:oe.workingColorSpace}));let xt=m.state.transmissionRenderTarget[it.id],St=it.viewport||D;xt.setSize(St.z,St.w);let Nt=S.getRenderTarget();S.setRenderTarget(xt),S.getClearColor(J),rt=S.getClearAlpha(),rt<1&&S.setClearColor(16777215,.5),S.clear(),Dt&&ut.render(nt);let Ft=S.toneMapping;S.toneMapping=yi;let $t=it.viewport;if(it.viewport!==void 0&&(it.viewport=void 0),m.setupLightsView(it),ht===!0&&lt.setGlobalState(S.clippingPlanes,it),Zr(T,nt,it),v.updateMultisampleRenderTarget(xt),v.updateRenderTargetMipmap(xt),Rt.has("WEBGL_multisampled_render_to_texture")===!1){let te=!1;for(let Ot=0,ae=X.length;Ot<ae;Ot++){let ye=X[Ot],Me=ye.object,tn=ye.geometry,ue=ye.material,kt=ye.group;if(ue.side===Oe&&Me.layers.test(it.layers)){let Xn=ue.side;ue.side=Ge,ue.needsUpdate=!0,Wh(Me,nt,it,tn,ue,kt),ue.side=Xn,ue.needsUpdate=!0,te=!0}}te===!0&&(v.updateMultisampleRenderTarget(xt),v.updateRenderTargetMipmap(xt))}S.setRenderTarget(Nt),S.setClearColor(J,rt),$t!==void 0&&(it.viewport=$t),S.toneMapping=Ft}function Zr(T,X,nt){let it=X.isScene===!0?X.overrideMaterial:null;for(let q=0,xt=T.length;q<xt;q++){let St=T[q],Nt=St.object,Ft=St.geometry,$t=it===null?St.material:it,te=St.group;Nt.layers.test(nt.layers)&&Wh(Nt,X,nt,Ft,$t,te)}}function Wh(T,X,nt,it,q,xt){T.onBeforeRender(S,X,nt,it,q,xt),T.modelViewMatrix.multiplyMatrices(nt.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),q.onBeforeRender(S,X,nt,it,T,xt),q.transparent===!0&&q.side===Oe&&q.forceSinglePass===!1?(q.side=Ge,q.needsUpdate=!0,S.renderBufferDirect(nt,X,it,q,T,xt),q.side=Mi,q.needsUpdate=!0,S.renderBufferDirect(nt,X,it,q,T,xt),q.side=Oe):S.renderBufferDirect(nt,X,it,q,T,xt),T.onAfterRender(S,X,nt,it,q,xt)}function $r(T,X,nt){X.isScene!==!0&&(X=fe);let it=k.get(T),q=m.state.lights,xt=m.state.shadowsArray,St=q.state.version,Nt=pt.getParameters(T,q.state,xt,X,nt),Ft=pt.getProgramCacheKey(Nt),$t=it.programs;it.environment=T.isMeshStandardMaterial?X.environment:null,it.fog=X.fog,it.envMap=(T.isMeshStandardMaterial?U:_).get(T.envMap||it.environment),it.envMapRotation=it.environment!==null&&T.envMap===null?X.environmentRotation:T.envMapRotation,$t===void 0&&(T.addEventListener("dispose",vt),$t=new Map,it.programs=$t);let te=$t.get(Ft);if(te!==void 0){if(it.currentProgram===te&&it.lightsStateVersion===St)return qh(T,Nt),te}else Nt.uniforms=pt.getUniforms(T),T.onBeforeCompile(Nt,S),te=pt.acquireProgram(Nt,Ft),$t.set(Ft,te),it.uniforms=Nt.uniforms;let Ot=it.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Ot.clippingPlanes=lt.uniform),qh(T,Nt),it.needsLights=ff(T),it.lightsStateVersion=St,it.needsLights&&(Ot.ambientLightColor.value=q.state.ambient,Ot.lightProbe.value=q.state.probe,Ot.directionalLights.value=q.state.directional,Ot.directionalLightShadows.value=q.state.directionalShadow,Ot.spotLights.value=q.state.spot,Ot.spotLightShadows.value=q.state.spotShadow,Ot.rectAreaLights.value=q.state.rectArea,Ot.ltc_1.value=q.state.rectAreaLTC1,Ot.ltc_2.value=q.state.rectAreaLTC2,Ot.pointLights.value=q.state.point,Ot.pointLightShadows.value=q.state.pointShadow,Ot.hemisphereLights.value=q.state.hemi,Ot.directionalShadowMap.value=q.state.directionalShadowMap,Ot.directionalShadowMatrix.value=q.state.directionalShadowMatrix,Ot.spotShadowMap.value=q.state.spotShadowMap,Ot.spotLightMatrix.value=q.state.spotLightMatrix,Ot.spotLightMap.value=q.state.spotLightMap,Ot.pointShadowMap.value=q.state.pointShadowMap,Ot.pointShadowMatrix.value=q.state.pointShadowMatrix),it.currentProgram=te,it.uniformsList=null,te}function Xh(T){if(T.uniformsList===null){let X=T.currentProgram.getUniforms();T.uniformsList=Ms.seqWithValue(X.seq,T.uniforms)}return T.uniformsList}function qh(T,X){let nt=k.get(T);nt.outputColorSpace=X.outputColorSpace,nt.batching=X.batching,nt.batchingColor=X.batchingColor,nt.instancing=X.instancing,nt.instancingColor=X.instancingColor,nt.instancingMorph=X.instancingMorph,nt.skinning=X.skinning,nt.morphTargets=X.morphTargets,nt.morphNormals=X.morphNormals,nt.morphColors=X.morphColors,nt.morphTargetsCount=X.morphTargetsCount,nt.numClippingPlanes=X.numClippingPlanes,nt.numIntersection=X.numClipIntersection,nt.vertexAlphas=X.vertexAlphas,nt.vertexTangents=X.vertexTangents,nt.toneMapping=X.toneMapping}function uf(T,X,nt,it,q){X.isScene!==!0&&(X=fe),v.resetTextureUnits();let xt=X.fog,St=it.isMeshStandardMaterial?X.environment:null,Nt=R===null?S.outputColorSpace:R.isXRRenderTarget===!0?R.texture.colorSpace:zs,Ft=(it.isMeshStandardMaterial?U:_).get(it.envMap||St),$t=it.vertexColors===!0&&!!nt.attributes.color&&nt.attributes.color.itemSize===4,te=!!nt.attributes.tangent&&(!!it.normalMap||it.anisotropy>0),Ot=!!nt.morphAttributes.position,ae=!!nt.morphAttributes.normal,ye=!!nt.morphAttributes.color,Me=yi;it.toneMapped&&(R===null||R.isXRRenderTarget===!0)&&(Me=S.toneMapping);let tn=nt.morphAttributes.position||nt.morphAttributes.normal||nt.morphAttributes.color,ue=tn!==void 0?tn.length:0,kt=k.get(it),Xn=m.state.lights;if(ht===!0&&(Et===!0||T!==b)){let pn=T===b&&it.id===A;lt.setState(it,T,pn)}let de=!1;it.version===kt.__version?(kt.needsLights&&kt.lightsStateVersion!==Xn.state.version||kt.outputColorSpace!==Nt||q.isBatchedMesh&&kt.batching===!1||!q.isBatchedMesh&&kt.batching===!0||q.isBatchedMesh&&kt.batchingColor===!0&&q.colorTexture===null||q.isBatchedMesh&&kt.batchingColor===!1&&q.colorTexture!==null||q.isInstancedMesh&&kt.instancing===!1||!q.isInstancedMesh&&kt.instancing===!0||q.isSkinnedMesh&&kt.skinning===!1||!q.isSkinnedMesh&&kt.skinning===!0||q.isInstancedMesh&&kt.instancingColor===!0&&q.instanceColor===null||q.isInstancedMesh&&kt.instancingColor===!1&&q.instanceColor!==null||q.isInstancedMesh&&kt.instancingMorph===!0&&q.morphTexture===null||q.isInstancedMesh&&kt.instancingMorph===!1&&q.morphTexture!==null||kt.envMap!==Ft||it.fog===!0&&kt.fog!==xt||kt.numClippingPlanes!==void 0&&(kt.numClippingPlanes!==lt.numPlanes||kt.numIntersection!==lt.numIntersection)||kt.vertexAlphas!==$t||kt.vertexTangents!==te||kt.morphTargets!==Ot||kt.morphNormals!==ae||kt.morphColors!==ye||kt.toneMapping!==Me||kt.morphTargetsCount!==ue)&&(de=!0):(de=!0,kt.__version=it.version);let En=kt.currentProgram;de===!0&&(En=$r(it,X,q));let Ki=!1,an=!1,js=!1,be=En.getUniforms(),Ln=kt.uniforms;if(C.useProgram(En.program)&&(Ki=!0,an=!0,js=!0),it.id!==A&&(A=it.id,an=!0),Ki||b!==T){C.buffers.depth.getReversed()?(mt.copy(T.projectionMatrix),bp(mt),Sp(mt),be.setValue(F,"projectionMatrix",mt)):be.setValue(F,"projectionMatrix",T.projectionMatrix),be.setValue(F,"viewMatrix",T.matrixWorldInverse);let hi=be.map.cameraPosition;hi!==void 0&&hi.setValue(F,Gt.setFromMatrixPosition(T.matrixWorld)),Jt.logarithmicDepthBuffer&&be.setValue(F,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(it.isMeshPhongMaterial||it.isMeshToonMaterial||it.isMeshLambertMaterial||it.isMeshBasicMaterial||it.isMeshStandardMaterial||it.isShaderMaterial)&&be.setValue(F,"isOrthographic",T.isOrthographicCamera===!0),b!==T&&(b=T,an=!0,js=!0)}if(q.isSkinnedMesh){be.setOptional(F,q,"bindMatrix"),be.setOptional(F,q,"bindMatrixInverse");let pn=q.skeleton;pn&&(pn.boneTexture===null&&pn.computeBoneTexture(),be.setValue(F,"boneTexture",pn.boneTexture,v))}q.isBatchedMesh&&(be.setOptional(F,q,"batchingTexture"),be.setValue(F,"batchingTexture",q._matricesTexture,v),be.setOptional(F,q,"batchingIdTexture"),be.setValue(F,"batchingIdTexture",q._indirectTexture,v),be.setOptional(F,q,"batchingColorTexture"),q._colorsTexture!==null&&be.setValue(F,"batchingColorTexture",q._colorsTexture,v));let Qs=nt.morphAttributes;if((Qs.position!==void 0||Qs.normal!==void 0||Qs.color!==void 0)&&Tt.update(q,nt,En),(an||kt.receiveShadow!==q.receiveShadow)&&(kt.receiveShadow=q.receiveShadow,be.setValue(F,"receiveShadow",q.receiveShadow)),it.isMeshGouraudMaterial&&it.envMap!==null&&(Ln.envMap.value=Ft,Ln.flipEnvMap.value=Ft.isCubeTexture&&Ft.isRenderTargetTexture===!1?-1:1),it.isMeshStandardMaterial&&it.envMap===null&&X.environment!==null&&(Ln.envMapIntensity.value=X.environmentIntensity),an&&(be.setValue(F,"toneMappingExposure",S.toneMappingExposure),kt.needsLights&&df(Ln,js),xt&&it.fog===!0&&ot.refreshFogUniforms(Ln,xt),ot.refreshMaterialUniforms(Ln,it,tt,ct,m.state.transmissionRenderTarget[T.id]),Ms.upload(F,Xh(kt),Ln,v)),it.isShaderMaterial&&it.uniformsNeedUpdate===!0&&(Ms.upload(F,Xh(kt),Ln,v),it.uniformsNeedUpdate=!1),it.isSpriteMaterial&&be.setValue(F,"center",q.center),be.setValue(F,"modelViewMatrix",q.modelViewMatrix),be.setValue(F,"normalMatrix",q.normalMatrix),be.setValue(F,"modelMatrix",q.matrixWorld),it.isShaderMaterial||it.isRawShaderMaterial){let pn=it.uniformsGroups;for(let hi=0,ui=pn.length;hi<ui;hi++){let Yh=pn[hi];M.update(Yh,En),M.bind(Yh,En)}}return En}function df(T,X){T.ambientLightColor.needsUpdate=X,T.lightProbe.needsUpdate=X,T.directionalLights.needsUpdate=X,T.directionalLightShadows.needsUpdate=X,T.pointLights.needsUpdate=X,T.pointLightShadows.needsUpdate=X,T.spotLights.needsUpdate=X,T.spotLightShadows.needsUpdate=X,T.rectAreaLights.needsUpdate=X,T.hemisphereLights.needsUpdate=X}function ff(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return O},this.getActiveMipmapLevel=function(){return y},this.getRenderTarget=function(){return R},this.setRenderTargetTextures=function(T,X,nt){k.get(T.texture).__webglTexture=X,k.get(T.depthTexture).__webglTexture=nt;let it=k.get(T);it.__hasExternalTextures=!0,it.__autoAllocateDepthBuffer=nt===void 0,it.__autoAllocateDepthBuffer||Rt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),it.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(T,X){let nt=k.get(T);nt.__webglFramebuffer=X,nt.__useDefaultFramebuffer=X===void 0},this.setRenderTarget=function(T,X=0,nt=0){R=T,O=X,y=nt;let it=!0,q=null,xt=!1,St=!1;if(T){let Ft=k.get(T);if(Ft.__useDefaultFramebuffer!==void 0)C.bindFramebuffer(F.FRAMEBUFFER,null),it=!1;else if(Ft.__webglFramebuffer===void 0)v.setupRenderTarget(T);else if(Ft.__hasExternalTextures)v.rebindTextures(T,k.get(T.texture).__webglTexture,k.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let Ot=T.depthTexture;if(Ft.__boundDepthTexture!==Ot){if(Ot!==null&&k.has(Ot)&&(T.width!==Ot.image.width||T.height!==Ot.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");v.setupDepthRenderbuffer(T)}}let $t=T.texture;($t.isData3DTexture||$t.isDataArrayTexture||$t.isCompressedArrayTexture)&&(St=!0);let te=k.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(te[X])?q=te[X][nt]:q=te[X],xt=!0):T.samples>0&&v.useMultisampledRTT(T)===!1?q=k.get(T).__webglMultisampledFramebuffer:Array.isArray(te)?q=te[nt]:q=te,D.copy(T.viewport),W.copy(T.scissor),Z=T.scissorTest}else D.copy(It).multiplyScalar(tt).floor(),W.copy(wt).multiplyScalar(tt).floor(),Z=Qt;if(C.bindFramebuffer(F.FRAMEBUFFER,q)&&it&&C.drawBuffers(T,q),C.viewport(D),C.scissor(W),C.setScissorTest(Z),xt){let Ft=k.get(T.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+X,Ft.__webglTexture,nt)}else if(St){let Ft=k.get(T.texture),$t=X||0;F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,Ft.__webglTexture,nt||0,$t)}A=-1},this.readRenderTargetPixels=function(T,X,nt,it,q,xt,St){if(!(T&&T.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Nt=k.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&St!==void 0&&(Nt=Nt[St]),Nt){C.bindFramebuffer(F.FRAMEBUFFER,Nt);try{let Ft=T.texture,$t=Ft.format,te=Ft.type;if(!Jt.textureFormatReadable($t)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Jt.textureTypeReadable(te)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}X>=0&&X<=T.width-it&&nt>=0&&nt<=T.height-q&&F.readPixels(X,nt,it,q,Bt.convert($t),Bt.convert(te),xt)}finally{let Ft=R!==null?k.get(R).__webglFramebuffer:null;C.bindFramebuffer(F.FRAMEBUFFER,Ft)}}},this.readRenderTargetPixelsAsync=async function(T,X,nt,it,q,xt,St){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Nt=k.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&St!==void 0&&(Nt=Nt[St]),Nt){let Ft=T.texture,$t=Ft.format,te=Ft.type;if(!Jt.textureFormatReadable($t))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Jt.textureTypeReadable(te))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(X>=0&&X<=T.width-it&&nt>=0&&nt<=T.height-q){C.bindFramebuffer(F.FRAMEBUFFER,Nt);let Ot=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,Ot),F.bufferData(F.PIXEL_PACK_BUFFER,xt.byteLength,F.STREAM_READ),F.readPixels(X,nt,it,q,Bt.convert($t),Bt.convert(te),0);let ae=R!==null?k.get(R).__webglFramebuffer:null;C.bindFramebuffer(F.FRAMEBUFFER,ae);let ye=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await Mp(F,ye,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,Ot),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,xt),F.deleteBuffer(Ot),F.deleteSync(ye),xt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(T,X=null,nt=0){T.isTexture!==!0&&(ar("WebGLRenderer: copyFramebufferToTexture function signature has changed."),X=arguments[0]||null,T=arguments[1]);let it=Math.pow(2,-nt),q=Math.floor(T.image.width*it),xt=Math.floor(T.image.height*it),St=X!==null?X.x:0,Nt=X!==null?X.y:0;v.setTexture2D(T,0),F.copyTexSubImage2D(F.TEXTURE_2D,nt,0,0,St,Nt,q,xt),C.unbindTexture()},this.copyTextureToTexture=function(T,X,nt=null,it=null,q=0){T.isTexture!==!0&&(ar("WebGLRenderer: copyTextureToTexture function signature has changed."),it=arguments[0]||null,T=arguments[1],X=arguments[2],q=arguments[3]||0,nt=null);let xt,St,Nt,Ft,$t,te,Ot,ae,ye,Me=T.isCompressedTexture?T.mipmaps[q]:T.image;nt!==null?(xt=nt.max.x-nt.min.x,St=nt.max.y-nt.min.y,Nt=nt.isBox3?nt.max.z-nt.min.z:1,Ft=nt.min.x,$t=nt.min.y,te=nt.isBox3?nt.min.z:0):(xt=Me.width,St=Me.height,Nt=Me.depth||1,Ft=0,$t=0,te=0),it!==null?(Ot=it.x,ae=it.y,ye=it.z):(Ot=0,ae=0,ye=0);let tn=Bt.convert(X.format),ue=Bt.convert(X.type),kt;X.isData3DTexture?(v.setTexture3D(X,0),kt=F.TEXTURE_3D):X.isDataArrayTexture||X.isCompressedArrayTexture?(v.setTexture2DArray(X,0),kt=F.TEXTURE_2D_ARRAY):(v.setTexture2D(X,0),kt=F.TEXTURE_2D),F.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,X.flipY),F.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,X.premultiplyAlpha),F.pixelStorei(F.UNPACK_ALIGNMENT,X.unpackAlignment);let Xn=F.getParameter(F.UNPACK_ROW_LENGTH),de=F.getParameter(F.UNPACK_IMAGE_HEIGHT),En=F.getParameter(F.UNPACK_SKIP_PIXELS),Ki=F.getParameter(F.UNPACK_SKIP_ROWS),an=F.getParameter(F.UNPACK_SKIP_IMAGES);F.pixelStorei(F.UNPACK_ROW_LENGTH,Me.width),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,Me.height),F.pixelStorei(F.UNPACK_SKIP_PIXELS,Ft),F.pixelStorei(F.UNPACK_SKIP_ROWS,$t),F.pixelStorei(F.UNPACK_SKIP_IMAGES,te);let js=T.isDataArrayTexture||T.isData3DTexture,be=X.isDataArrayTexture||X.isData3DTexture;if(T.isRenderTargetTexture||T.isDepthTexture){let Ln=k.get(T),Qs=k.get(X),pn=k.get(Ln.__renderTarget),hi=k.get(Qs.__renderTarget);C.bindFramebuffer(F.READ_FRAMEBUFFER,pn.__webglFramebuffer),C.bindFramebuffer(F.DRAW_FRAMEBUFFER,hi.__webglFramebuffer);for(let ui=0;ui<Nt;ui++)js&&F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,k.get(T).__webglTexture,q,te+ui),T.isDepthTexture?(be&&F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,k.get(X).__webglTexture,q,ye+ui),F.blitFramebuffer(Ft,$t,xt,St,Ot,ae,xt,St,F.DEPTH_BUFFER_BIT,F.NEAREST)):be?F.copyTexSubImage3D(kt,q,Ot,ae,ye+ui,Ft,$t,xt,St):F.copyTexSubImage2D(kt,q,Ot,ae,ye+ui,Ft,$t,xt,St);C.bindFramebuffer(F.READ_FRAMEBUFFER,null),C.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else be?T.isDataTexture||T.isData3DTexture?F.texSubImage3D(kt,q,Ot,ae,ye,xt,St,Nt,tn,ue,Me.data):X.isCompressedArrayTexture?F.compressedTexSubImage3D(kt,q,Ot,ae,ye,xt,St,Nt,tn,Me.data):F.texSubImage3D(kt,q,Ot,ae,ye,xt,St,Nt,tn,ue,Me):T.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,q,Ot,ae,xt,St,tn,ue,Me.data):T.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,q,Ot,ae,Me.width,Me.height,tn,Me.data):F.texSubImage2D(F.TEXTURE_2D,q,Ot,ae,xt,St,tn,ue,Me);F.pixelStorei(F.UNPACK_ROW_LENGTH,Xn),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,de),F.pixelStorei(F.UNPACK_SKIP_PIXELS,En),F.pixelStorei(F.UNPACK_SKIP_ROWS,Ki),F.pixelStorei(F.UNPACK_SKIP_IMAGES,an),q===0&&X.generateMipmaps&&F.generateMipmap(kt),C.unbindTexture()},this.copyTextureToTexture3D=function(T,X,nt=null,it=null,q=0){return T.isTexture!==!0&&(ar("WebGLRenderer: copyTextureToTexture3D function signature has changed."),nt=arguments[0]||null,it=arguments[1]||null,T=arguments[2],X=arguments[3],q=arguments[4]||0),ar('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(T,X,nt,it,q)},this.initRenderTarget=function(T){k.get(T).__webglFramebuffer===void 0&&v.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?v.setTextureCube(T,0):T.isData3DTexture?v.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?v.setTexture2DArray(T,0):v.setTexture2D(T,0),C.unbindTexture()},this.resetState=function(){O=0,y=0,R=null,C.reset(),se.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Qn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorspace=oe._getDrawingBufferColorSpace(t),e.unpackColorSpace=oe._getUnpackColorSpace()}};var bi=class extends ze{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new zn,this.environmentIntensity=1,this.environmentRotation=new zn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}};var qu=new I,Yu=new ce,Zu=new ce,x_=new I,$u=new Yt,_o=new I,_l=new ii,Ju=new Yt,vl=new Vi,Ho=class extends qt{constructor(t,e){super(t,e),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Kh,this.bindMatrix=new Yt,this.bindMatrixInverse=new Yt,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let t=this.geometry;this.boundingBox===null&&(this.boundingBox=new xn),this.boundingBox.makeEmpty();let e=t.getAttribute("position");for(let n=0;n<e.count;n++)this.getVertexPosition(n,_o),this.boundingBox.expandByPoint(_o)}computeBoundingSphere(){let t=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new ii),this.boundingSphere.makeEmpty();let e=t.getAttribute("position");for(let n=0;n<e.count;n++)this.getVertexPosition(n,_o),this.boundingSphere.expandByPoint(_o)}copy(t,e){return super.copy(t,e),this.bindMode=t.bindMode,this.bindMatrix.copy(t.bindMatrix),this.bindMatrixInverse.copy(t.bindMatrixInverse),this.skeleton=t.skeleton,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}raycast(t,e){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),_l.copy(this.boundingSphere),_l.applyMatrix4(s),t.ray.intersectsSphere(_l)!==!1&&(Ju.copy(s).invert(),vl.copy(t.ray).applyMatrix4(Ju),!(this.boundingBox!==null&&vl.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(t,e,vl)))}getVertexPosition(t,e){return super.getVertexPosition(t,e),this.applyBoneTransform(t,e),e}bind(t,e){this.skeleton=t,e===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),e=this.matrixWorld),this.bindMatrix.copy(e),this.bindMatrixInverse.copy(e).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let t=new ce,e=this.geometry.attributes.skinWeight;for(let n=0,s=e.count;n<s;n++){t.fromBufferAttribute(e,n);let r=1/t.manhattanLength();r!==1/0?t.multiplyScalar(r):t.set(1,0,0,0),e.setXYZW(n,t.x,t.y,t.z,t.w)}}updateMatrixWorld(t){super.updateMatrixWorld(t),this.bindMode===Kh?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Wf?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(t,e){let n=this.skeleton,s=this.geometry;Yu.fromBufferAttribute(s.attributes.skinIndex,t),Zu.fromBufferAttribute(s.attributes.skinWeight,t),qu.copy(e).applyMatrix4(this.bindMatrix),e.set(0,0,0);for(let r=0;r<4;r++){let o=Zu.getComponent(r);if(o!==0){let a=Yu.getComponent(r);$u.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),e.addScaledVector(x_.copy(qu).applyMatrix4($u),o)}}return e.applyMatrix4(this.bindMatrixInverse)}},_r=class extends ze{constructor(){super(),this.isBone=!0,this.type="Bone"}},Ds=class extends We{constructor(t=null,e=1,n=1,s,r,o,a,c,h=Ke,l=Ke,u,d){super(null,o,a,c,h,l,s,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Ku=new Yt,__=new Yt,Vo=class i{constructor(t=[],e=[]){this.uuid=ai(),this.bones=t.slice(0),this.boneInverses=e,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let t=this.bones,e=this.boneInverses;if(this.boneMatrices=new Float32Array(t.length*16),e.length===0)this.calculateInverses();else if(t.length!==e.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new Yt)}}calculateInverses(){this.boneInverses.length=0;for(let t=0,e=this.bones.length;t<e;t++){let n=new Yt;this.bones[t]&&n.copy(this.bones[t].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let t=0,e=this.bones.length;t<e;t++){let n=this.bones[t];n&&n.matrixWorld.copy(this.boneInverses[t]).invert()}for(let t=0,e=this.bones.length;t<e;t++){let n=this.bones[t];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let t=this.bones,e=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,o=t.length;r<o;r++){let a=t[r]?t[r].matrixWorld:__;Ku.multiplyMatrices(a,e[r]),Ku.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let t=Math.sqrt(this.bones.length*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);let e=new Float32Array(t*t*4);e.set(this.boneMatrices);let n=new Ds(e,t,t,gn,Cn);return n.needsUpdate=!0,this.boneMatrices=e,this.boneTexture=n,this}getBoneByName(t){for(let e=0,n=this.bones.length;e<n;e++){let s=this.bones[e];if(s.name===t)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(t,e){this.uuid=t.uuid;for(let n=0,s=t.bones.length;n<s;n++){let r=t.bones[n],o=e[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new _r),this.bones.push(o),this.boneInverses.push(new Yt().fromArray(t.boneInverses[n]))}return this.init(),this}toJSON(){let t={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};t.uuid=this.uuid;let e=this.bones,n=this.boneInverses;for(let s=0,r=e.length;s<r;s++){let o=e[s];t.bones.push(o.uuid);let a=n[s];t.boneInverses.push(a.toArray())}return t}},vr=class extends Te{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},ds=new Yt,ju=new Yt,vo=[],Qu=new xn,v_=new Yt,sr=new qt,rr=new ii,yr=class extends qt{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new vr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,v_)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new xn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ds),Qu.copy(t.boundingBox).applyMatrix4(ds),this.boundingBox.union(Qu)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new ii),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ds),rr.copy(t.boundingSphere).applyMatrix4(ds),this.boundingSphere.union(rr)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(sr.geometry=this.geometry,sr.material=this.material,sr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),rr.copy(this.boundingSphere),rr.applyMatrix4(n),t.ray.intersectsSphere(rr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,ds),ju.multiplyMatrices(n,ds),sr.matrixWorld=ju,sr.raycast(t,vo);for(let o=0,a=vo.length;o<a;o++){let c=vo[o];c.instanceId=r,c.object=this,e.push(c)}vo.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new vr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Ds(new Float32Array(s*this.count),s,this.count,Kc,Cn));let r=this.morphTexture.source.data.data,o=0;for(let h=0;h<n.length;h++)o+=n[h];let a=this.geometry.morphTargetsRelative?1:1-o,c=s*t;r[c]=a,r.set(n,c+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var Go=class extends We{constructor(t,e,n,s,r,o,a,c,h){super(t,e,n,s,r,o,a,c,h),this.isCanvasTexture=!0,this.needsUpdate=!0}},yn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){let n=this.getLengths(),s=0,r=n.length,o;e?o=e:o=t*n[r-1];let a=0,c=r-1,h;for(;a<=c;)if(s=Math.floor(a+(c-a)/2),h=n[s]-o,h<0)a=s+1;else if(h>0)c=s-1;else{c=s;break}if(s=c,n[s]===o)return s/(r-1);let l=n[s],d=n[s+1]-l,f=(o-l)/d;return(s+f)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),c=e||(o.isVector2?new yt:new I);return c.copy(a).sub(o).normalize(),c}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){let n=new I,s=[],r=[],o=[],a=new I,c=new Yt;for(let f=0;f<=t;f++){let p=f/t;s[f]=this.getTangentAt(p,new I)}r[0]=new I,o[0]=new I;let h=Number.MAX_VALUE,l=Math.abs(s[0].x),u=Math.abs(s[0].y),d=Math.abs(s[0].z);l<=h&&(h=l,n.set(1,0,0)),u<=h&&(h=u,n.set(0,1,0)),d<=h&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();let p=Math.acos(De(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(c.makeRotationAxis(a,p))}o[f].crossVectors(s[f],r[f])}if(e===!0){let f=Math.acos(De(r[0].dot(r[t]),-1,1));f/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(f=-f);for(let p=1;p<=t;p++)r[p].applyMatrix4(c.makeRotationAxis(s[p],f*p)),o[p].crossVectors(s[p],r[p])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},Mr=class extends yn{constructor(t=0,e=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(t,e=new yt){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+t*r,c=this.aX+this.xRadius*Math.cos(a),h=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let l=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=c-this.aX,f=h-this.aY;c=d*l-f*u+this.aX,h=d*u+f*l+this.aY}return n.set(c,h)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Tc=class extends Mr{constructor(t,e,n,s,r,o){super(t,e,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function rh(){let i=0,t=0,e=0,n=0;function s(r,o,a,c){i=r,t=a,e=-3*r+3*o-2*a-c,n=2*r-2*o+a+c}return{initCatmullRom:function(r,o,a,c,h){s(o,a,h*(a-r),h*(c-o))},initNonuniformCatmullRom:function(r,o,a,c,h,l,u){let d=(o-r)/h-(a-r)/(h+l)+(a-o)/l,f=(a-o)/l-(c-o)/(l+u)+(c-a)/u;d*=l,f*=l,s(o,a,d,f)},calc:function(r){let o=r*r,a=o*r;return i+t*r+e*o+n*a}}}var yo=new I,yl=new rh,Ml=new rh,bl=new rh,Ac=class extends yn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new I){let n=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t,a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:c===0&&a===r-1&&(a=r-2,c=1);let h,l;this.closed||a>0?h=s[(a-1)%r]:(yo.subVectors(s[0],s[1]).add(s[0]),h=yo);let u=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?l=s[(a+2)%r]:(yo.subVectors(s[r-1],s[r-2]).add(s[r-1]),l=yo),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,p=Math.pow(h.distanceToSquared(u),f),x=Math.pow(u.distanceToSquared(d),f),g=Math.pow(d.distanceToSquared(l),f);x<1e-4&&(x=1),p<1e-4&&(p=x),g<1e-4&&(g=x),yl.initNonuniformCatmullRom(h.x,u.x,d.x,l.x,p,x,g),Ml.initNonuniformCatmullRom(h.y,u.y,d.y,l.y,p,x,g),bl.initNonuniformCatmullRom(h.z,u.z,d.z,l.z,p,x,g)}else this.curveType==="catmullrom"&&(yl.initCatmullRom(h.x,u.x,d.x,l.x,this.tension),Ml.initCatmullRom(h.y,u.y,d.y,l.y,this.tension),bl.initCatmullRom(h.z,u.z,d.z,l.z,this.tension));return n.set(yl.calc(c),Ml.calc(c),bl.calc(c)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new I().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function td(i,t,e,n,s){let r=(n-t)*.5,o=(s-e)*.5,a=i*i,c=i*a;return(2*e-2*n+r+o)*c+(-3*e+3*n-2*r-o)*a+r*i+e}function y_(i,t){let e=1-i;return e*e*t}function M_(i,t){return 2*(1-i)*i*t}function b_(i,t){return i*i*t}function dr(i,t,e,n){return y_(i,t)+M_(i,e)+b_(i,n)}function S_(i,t){let e=1-i;return e*e*e*t}function w_(i,t){let e=1-i;return 3*e*e*i*t}function E_(i,t){return 3*(1-i)*i*i*t}function T_(i,t){return i*i*i*t}function fr(i,t,e,n,s){return S_(i,t)+w_(i,e)+E_(i,n)+T_(i,s)}var Wo=class extends yn{constructor(t=new yt,e=new yt,n=new yt,s=new yt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new yt){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(fr(t,s.x,r.x,o.x,a.x),fr(t,s.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Rc=class extends yn{constructor(t=new I,e=new I,n=new I,s=new I){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new I){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(fr(t,s.x,r.x,o.x,a.x),fr(t,s.y,r.y,o.y,a.y),fr(t,s.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Xo=class extends yn{constructor(t=new yt,e=new yt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new yt){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new yt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Cc=class extends yn{constructor(t=new I,e=new I){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new I){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new I){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},qo=class extends yn{constructor(t=new yt,e=new yt,n=new yt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new yt){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(dr(t,s.x,r.x,o.x),dr(t,s.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Pc=class extends yn{constructor(t=new I,e=new I,n=new I){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new I){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(dr(t,s.x,r.x,o.x),dr(t,s.y,r.y,o.y),dr(t,s.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Yo=class extends yn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new yt){let n=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,c=s[o===0?o:o-1],h=s[o],l=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return n.set(td(a,c.x,h.x,l.x,u.x),td(a,c.y,h.y,l.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new yt().fromArray(s))}return this}},ed=Object.freeze({__proto__:null,ArcCurve:Tc,CatmullRomCurve3:Ac,CubicBezierCurve:Wo,CubicBezierCurve3:Rc,EllipseCurve:Mr,LineCurve:Xo,LineCurve3:Cc,QuadraticBezierCurve:qo,QuadraticBezierCurve3:Pc,SplineCurve:Yo}),Ic=class extends yn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new ed[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],c=a.getLength(),h=c===0?0:1-o/c;return a.getPointAt(h,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,c=o.getPoints(a);for(let h=0;h<c.length;h++){let l=c[h];n&&n.equals(l)||(e.push(l),n=l)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new ed[s.type]().fromJSON(s))}return this}},Zo=class extends Ic{constructor(t){super(),this.type="Path",this.currentPoint=new yt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new Xo(this.currentPoint.clone(),new yt(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){let r=new qo(this.currentPoint.clone(),new yt(t,e),new yt(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,o){let a=new Wo(this.currentPoint.clone(),new yt(t,e),new yt(n,s),new yt(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new Yo(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,o){let a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(t+a,e+c,n,s,r,o),this}absarc(t,e,n,s,r,o){return this.absellipse(t,e,n,n,s,r,o),this}ellipse(t,e,n,s,r,o,a,c){let h=this.currentPoint.x,l=this.currentPoint.y;return this.absellipse(t+h,e+l,n,s,r,o,a,c),this}absellipse(t,e,n,s,r,o,a,c){let h=new Mr(t,e,n,s,r,o,a,c);if(this.curves.length>0){let u=h.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(h);let l=h.getPoint(1);return this.currentPoint.copy(l),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}};var Ls=class i extends Xe{constructor(t=1,e=1,n=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};let h=this;s=Math.floor(s),r=Math.floor(r);let l=[],u=[],d=[],f=[],p=0,x=[],g=n/2,m=0;w(),o===!1&&(t>0&&E(!0),e>0&&E(!1)),this.setIndex(l),this.setAttribute("position",new we(u,3)),this.setAttribute("normal",new we(d,3)),this.setAttribute("uv",new we(f,2));function w(){let S=new I,V=new I,O=0,y=(e-t)/n;for(let R=0;R<=r;R++){let A=[],b=R/r,D=b*(e-t)+t;for(let W=0;W<=s;W++){let Z=W/s,J=Z*c+a,rt=Math.sin(J),K=Math.cos(J);V.x=D*rt,V.y=-b*n+g,V.z=D*K,u.push(V.x,V.y,V.z),S.set(rt,y,K).normalize(),d.push(S.x,S.y,S.z),f.push(Z,1-b),A.push(p++)}x.push(A)}for(let R=0;R<s;R++)for(let A=0;A<r;A++){let b=x[A][R],D=x[A+1][R],W=x[A+1][R+1],Z=x[A][R+1];(t>0||A!==0)&&(l.push(b,D,Z),O+=3),(e>0||A!==r-1)&&(l.push(D,W,Z),O+=3)}h.addGroup(m,O,0),m+=O}function E(S){let V=p,O=new yt,y=new I,R=0,A=S===!0?t:e,b=S===!0?1:-1;for(let W=1;W<=s;W++)u.push(0,g*b,0),d.push(0,b,0),f.push(.5,.5),p++;let D=p;for(let W=0;W<=s;W++){let J=W/s*c+a,rt=Math.cos(J),K=Math.sin(J);y.x=A*K,y.y=g*b,y.z=A*rt,u.push(y.x,y.y,y.z),d.push(0,b,0),O.x=rt*.5+.5,O.y=K*.5*b+.5,f.push(O.x,O.y),p++}for(let W=0;W<s;W++){let Z=V+W,J=D+W;S===!0?l.push(J,J+1,Z):l.push(J+1,J,Z),R+=3}h.addGroup(m,R,S===!0?1:2),m+=R}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var br=class extends Zo{constructor(t){super(t),this.uuid=ai(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(new Zo().fromJSON(s))}return this}},A_={triangulate:function(i,t,e=2){let n=t&&t.length,s=n?t[0]*e:i.length,r=Ud(i,0,s,e,!0),o=[];if(!r||r.next===r.prev)return o;let a,c,h,l,u,d,f;if(n&&(r=D_(i,t,r,e)),i.length>80*e){a=h=i[0],c=l=i[1];for(let p=e;p<s;p+=e)u=i[p],d=i[p+1],u<a&&(a=u),d<c&&(c=d),u>h&&(h=u),d>l&&(l=d);f=Math.max(h-a,l-c),f=f!==0?32767/f:0}return Sr(r,o,e,a,c,f,0),o}};function Ud(i,t,e,n,s){let r,o;if(s===G_(i,t,e,n)>0)for(r=t;r<e;r+=n)o=nd(r,i[r],i[r+1],o);else for(r=e-n;r>=t;r-=n)o=nd(r,i[r],i[r+1],o);return o&&ua(o,o.next)&&(Er(o),o=o.next),o}function Wi(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(ua(e,e.next)||Ae(e.prev,e,e.next)===0)){if(Er(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Sr(i,t,e,n,s,r,o){if(!i)return;!o&&r&&O_(i,n,s,r);let a=i,c,h;for(;i.prev!==i.next;){if(c=i.prev,h=i.next,r?C_(i,n,s,r):R_(i)){t.push(c.i/e|0),t.push(i.i/e|0),t.push(h.i/e|0),Er(i),i=h.next,a=h.next;continue}if(i=h,i===a){o?o===1?(i=P_(Wi(i),t,e),Sr(i,t,e,n,s,r,2)):o===2&&I_(i,t,e,n,s,r):Sr(Wi(i),t,e,n,s,r,1);break}}}function R_(i){let t=i.prev,e=i,n=i.next;if(Ae(t,e,n)>=0)return!1;let s=t.x,r=e.x,o=n.x,a=t.y,c=e.y,h=n.y,l=s<r?s<o?s:o:r<o?r:o,u=a<c?a<h?a:h:c<h?c:h,d=s>r?s>o?s:o:r>o?r:o,f=a>c?a>h?a:h:c>h?c:h,p=n.next;for(;p!==t;){if(p.x>=l&&p.x<=d&&p.y>=u&&p.y<=f&&xs(s,a,r,c,o,h,p.x,p.y)&&Ae(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function C_(i,t,e,n){let s=i.prev,r=i,o=i.next;if(Ae(s,r,o)>=0)return!1;let a=s.x,c=r.x,h=o.x,l=s.y,u=r.y,d=o.y,f=a<c?a<h?a:h:c<h?c:h,p=l<u?l<d?l:d:u<d?u:d,x=a>c?a>h?a:h:c>h?c:h,g=l>u?l>d?l:d:u>d?u:d,m=Dc(f,p,t,e,n),w=Dc(x,g,t,e,n),E=i.prevZ,S=i.nextZ;for(;E&&E.z>=m&&S&&S.z<=w;){if(E.x>=f&&E.x<=x&&E.y>=p&&E.y<=g&&E!==s&&E!==o&&xs(a,l,c,u,h,d,E.x,E.y)&&Ae(E.prev,E,E.next)>=0||(E=E.prevZ,S.x>=f&&S.x<=x&&S.y>=p&&S.y<=g&&S!==s&&S!==o&&xs(a,l,c,u,h,d,S.x,S.y)&&Ae(S.prev,S,S.next)>=0))return!1;S=S.nextZ}for(;E&&E.z>=m;){if(E.x>=f&&E.x<=x&&E.y>=p&&E.y<=g&&E!==s&&E!==o&&xs(a,l,c,u,h,d,E.x,E.y)&&Ae(E.prev,E,E.next)>=0)return!1;E=E.prevZ}for(;S&&S.z<=w;){if(S.x>=f&&S.x<=x&&S.y>=p&&S.y<=g&&S!==s&&S!==o&&xs(a,l,c,u,h,d,S.x,S.y)&&Ae(S.prev,S,S.next)>=0)return!1;S=S.nextZ}return!0}function P_(i,t,e){let n=i;do{let s=n.prev,r=n.next.next;!ua(s,r)&&Nd(s,n,n.next,r)&&wr(s,r)&&wr(r,s)&&(t.push(s.i/e|0),t.push(n.i/e|0),t.push(r.i/e|0),Er(n),Er(n.next),n=i=r),n=n.next}while(n!==i);return Wi(n)}function I_(i,t,e,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&B_(o,a)){let c=Fd(o,a);o=Wi(o,o.next),c=Wi(c,c.next),Sr(o,t,e,n,s,r,0),Sr(c,t,e,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function D_(i,t,e,n){let s=[],r,o,a,c,h;for(r=0,o=t.length;r<o;r++)a=t[r]*n,c=r<o-1?t[r+1]*n:i.length,h=Ud(i,a,c,n,!1),h===h.next&&(h.steiner=!0),s.push(z_(h));for(s.sort(L_),r=0;r<s.length;r++)e=U_(s[r],e);return e}function L_(i,t){return i.x-t.x}function U_(i,t){let e=N_(i,t);if(!e)return t;let n=Fd(e,i);return Wi(n,n.next),Wi(e,e.next)}function N_(i,t){let e=t,n=-1/0,s,r=i.x,o=i.y;do{if(o<=e.y&&o>=e.next.y&&e.next.y!==e.y){let d=e.x+(o-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=r&&d>n&&(n=d,s=e.x<e.next.x?e:e.next,d===r))return s}e=e.next}while(e!==t);if(!s)return null;let a=s,c=s.x,h=s.y,l=1/0,u;e=s;do r>=e.x&&e.x>=c&&r!==e.x&&xs(o<h?r:n,o,c,h,o<h?n:r,o,e.x,e.y)&&(u=Math.abs(o-e.y)/(r-e.x),wr(e,i)&&(u<l||u===l&&(e.x>s.x||e.x===s.x&&F_(s,e)))&&(s=e,l=u)),e=e.next;while(e!==a);return s}function F_(i,t){return Ae(i.prev,i,t.prev)<0&&Ae(t.next,i,i.next)<0}function O_(i,t,e,n){let s=i;do s.z===0&&(s.z=Dc(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,k_(s)}function k_(i){let t,e,n,s,r,o,a,c,h=1;do{for(e=i,i=null,r=null,o=0;e;){for(o++,n=e,a=0,t=0;t<h&&(a++,n=n.nextZ,!!n);t++);for(c=h;a>0||c>0&&n;)a!==0&&(c===0||!n||e.z<=n.z)?(s=e,e=e.nextZ,a--):(s=n,n=n.nextZ,c--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;e=n}r.nextZ=null,h*=2}while(o>1);return i}function Dc(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function z_(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function xs(i,t,e,n,s,r,o,a){return(s-o)*(t-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(s-o)*(n-a)}function B_(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!H_(i,t)&&(wr(i,t)&&wr(t,i)&&V_(i,t)&&(Ae(i.prev,i,t.prev)||Ae(i,t.prev,t))||ua(i,t)&&Ae(i.prev,i,i.next)>0&&Ae(t.prev,t,t.next)>0)}function Ae(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function ua(i,t){return i.x===t.x&&i.y===t.y}function Nd(i,t,e,n){let s=bo(Ae(i,t,e)),r=bo(Ae(i,t,n)),o=bo(Ae(e,n,i)),a=bo(Ae(e,n,t));return!!(s!==r&&o!==a||s===0&&Mo(i,e,t)||r===0&&Mo(i,n,t)||o===0&&Mo(e,i,n)||a===0&&Mo(e,t,n))}function Mo(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function bo(i){return i>0?1:i<0?-1:0}function H_(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&Nd(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function wr(i,t){return Ae(i.prev,i,i.next)<0?Ae(i,t,i.next)>=0&&Ae(i,i.prev,t)>=0:Ae(i,t,i.prev)<0||Ae(i,i.next,t)<0}function V_(i,t){let e=i,n=!1,s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function Fd(i,t){let e=new Lc(i.i,i.x,i.y),n=new Lc(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function nd(i,t,e,n){let s=new Lc(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Er(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Lc(i,t,e){this.i=i,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function G_(i,t,e,n){let s=0;for(let r=t,o=e-n;r<e;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var pr=class i{static area(t){let e=t.length,n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return i.area(t)<0}static triangulateShape(t,e){let n=[],s=[],r=[];id(t),sd(n,t);let o=t.length;e.forEach(id);for(let c=0;c<e.length;c++)s.push(o),o+=e[c].length,sd(n,e[c]);let a=A_.triangulate(n,s);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}};function id(i){let t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function sd(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}var $o=class i extends Xe{constructor(t=.5,e=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);let a=[],c=[],h=[],l=[],u=t,d=(e-t)/s,f=new I,p=new yt;for(let x=0;x<=s;x++){for(let g=0;g<=n;g++){let m=r+g/n*o;f.x=u*Math.cos(m),f.y=u*Math.sin(m),c.push(f.x,f.y,f.z),h.push(0,0,1),p.x=(f.x/e+1)/2,p.y=(f.y/e+1)/2,l.push(p.x,p.y)}u+=d}for(let x=0;x<s;x++){let g=x*(n+1);for(let m=0;m<n;m++){let w=m+g,E=w,S=w+n+1,V=w+n+2,O=w+1;a.push(E,S,O),a.push(S,V,O)}}this.setIndex(a),this.setAttribute("position",new we(c,3)),this.setAttribute("normal",new we(h,3)),this.setAttribute("uv",new we(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}},Jo=class i extends Xe{constructor(t=new br([new yt(0,.5),new yt(-.5,-.5),new yt(.5,-.5)]),e=12){super(),this.type="ShapeGeometry",this.parameters={shapes:t,curveSegments:e};let n=[],s=[],r=[],o=[],a=0,c=0;if(Array.isArray(t)===!1)h(t);else for(let l=0;l<t.length;l++)h(t[l]),this.addGroup(a,c,l),a+=c,c=0;this.setIndex(n),this.setAttribute("position",new we(s,3)),this.setAttribute("normal",new we(r,3)),this.setAttribute("uv",new we(o,2));function h(l){let u=s.length/3,d=l.extractPoints(e),f=d.shape,p=d.holes;pr.isClockWise(f)===!1&&(f=f.reverse());for(let g=0,m=p.length;g<m;g++){let w=p[g];pr.isClockWise(w)===!0&&(p[g]=w.reverse())}let x=pr.triangulateShape(f,p);for(let g=0,m=p.length;g<m;g++){let w=p[g];f=f.concat(w)}for(let g=0,m=f.length;g<m;g++){let w=f[g];s.push(w.x,w.y,0),r.push(0,0,1),o.push(w.x,w.y)}for(let g=0,m=x.length;g<m;g++){let w=x[g],E=w[0]+u,S=w[1]+u,V=w[2]+u;n.push(E,S,V),c+=3}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes;return W_(e,t)}static fromJSON(t,e){let n=[];for(let s=0,r=t.shapes.length;s<r;s++){let o=e[t.shapes[s]];n.push(o)}return new i(n,t.curveSegments)}};function W_(i,t){if(t.shapes=[],Array.isArray(i))for(let e=0,n=i.length;e<n;e++){let s=i[e];t.shapes.push(s.uuid)}else t.shapes.push(i.uuid);return t}var Ko=class i extends Xe{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let c=Math.min(o+a,Math.PI),h=0,l=[],u=new I,d=new I,f=[],p=[],x=[],g=[];for(let m=0;m<=n;m++){let w=[],E=m/n,S=0;m===0&&o===0?S=.5/e:m===n&&c===Math.PI&&(S=-.5/e);for(let V=0;V<=e;V++){let O=V/e;u.x=-t*Math.cos(s+O*r)*Math.sin(o+E*a),u.y=t*Math.cos(o+E*a),u.z=t*Math.sin(s+O*r)*Math.sin(o+E*a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),x.push(d.x,d.y,d.z),g.push(O+S,1-E),w.push(h++)}l.push(w)}for(let m=0;m<n;m++)for(let w=0;w<e;w++){let E=l[m][w+1],S=l[m][w],V=l[m+1][w],O=l[m+1][w+1];(m!==0||o>0)&&f.push(E,S,O),(m!==n-1||c<Math.PI)&&f.push(S,V,O)}this.setIndex(f),this.setAttribute("position",new we(p,3)),this.setAttribute("normal",new we(x,3)),this.setAttribute("uv",new we(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var si=class i extends Xe{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);let o=[],a=[],c=[],h=[],l=new I,u=new I,d=new I;for(let f=0;f<=n;f++)for(let p=0;p<=s;p++){let x=p/s*r,g=f/n*Math.PI*2;u.x=(t+e*Math.cos(g))*Math.cos(x),u.y=(t+e*Math.cos(g))*Math.sin(x),u.z=e*Math.sin(g),a.push(u.x,u.y,u.z),l.x=t*Math.cos(x),l.y=t*Math.sin(x),d.subVectors(u,l).normalize(),c.push(d.x,d.y,d.z),h.push(p/s),h.push(f/n)}for(let f=1;f<=n;f++)for(let p=1;p<=s;p++){let x=(s+1)*f+p-1,g=(s+1)*(f-1)+p-1,m=(s+1)*(f-1)+p,w=(s+1)*f+p;o.push(x,g,w),o.push(g,m,w)}this.setIndex(o),this.setAttribute("position",new we(a,3)),this.setAttribute("normal",new we(c,3)),this.setAttribute("uv",new we(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}};var le=class extends Gi{static get type(){return"MeshStandardMaterial"}constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new Wt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Wt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=wd,this.normalScale=new yt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new zn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Tr=class extends le{static get type(){return"MeshPhysicalMaterial"}constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new yt(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return De(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Wt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Wt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Wt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};function So(i,t,e){return!i||!e&&i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function X_(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function q_(i){function t(s,r){return i[s]-i[r]}let e=i.length,n=new Array(e);for(let s=0;s!==e;++s)n[s]=s;return n.sort(t),n}function rd(i,t,e){let n=i.length,s=new i.constructor(n);for(let r=0,o=0;o!==n;++r){let a=e[r]*t;for(let c=0;c!==t;++c)s[o++]=i[a+c]}return s}function Od(i,t,e,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(t.push(r.time),e.push.apply(e,o)),r=i[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(t.push(r.time),o.toArray(e,e.length)),r=i[s++];while(r!==void 0);else do o=r[n],o!==void 0&&(t.push(r.time),e.push(o)),r=i[s++];while(r!==void 0)}var Us=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];t:{e:{let o;n:{i:if(!(t<s)){for(let a=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=e[++n],t<s)break e}o=e.length;break n}if(!(t>=r)){let a=e[1];t<a&&(n=2,r=a);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=e[--n-1],t>=r)break e}o=n,n=0;break n}break t}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let o=0;o!==s;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},Uc=class extends Us{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ps,endingEnd:ps}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,o=t+1,a=s[r],c=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case ms:r=t,a=2*e-n;break;case Io:r=s.length-2,a=e+s[r]-s[r+1];break;default:r=t,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case ms:o=t,c=2*n-e;break;case Io:o=1,c=n+s[1]-s[0];break;default:o=t-1,c=e}let h=(n-e)*.5,l=this.valueSize;this._weightPrev=h/(e-a),this._weightNext=h/(c-n),this._offsetPrev=r*l,this._offsetNext=o*l}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,h=c-a,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-e)/(s-e),x=p*p,g=x*p,m=-d*g+2*d*x-d*p,w=(1+d)*g+(-1.5-2*d)*x+(-.5+d)*p+1,E=(-1-f)*g+(1.5+f)*x+.5*p,S=f*g-f*x;for(let V=0;V!==a;++V)r[V]=m*o[l+V]+w*o[h+V]+E*o[c+V]+S*o[u+V];return r}},jo=class extends Us{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,h=c-a,l=(n-e)/(s-e),u=1-l;for(let d=0;d!==a;++d)r[d]=o[h+d]*u+o[c+d]*l;return r}},Nc=class extends Us{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},Mn=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=So(e,this.TimeBufferType),this.values=So(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:So(t.times,Array),values:So(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Nc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new jo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Uc(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case Po:e=this.InterpolantFactoryMethodDiscrete;break;case cc:e=this.InterpolantFactoryMethodLinear;break;case Xa:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Po;case this.InterpolantFactoryMethodLinear:return cc;case this.InterpolantFactoryMethodSmooth:return Xa}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t}return this}trim(t,e){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let c=n[a];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,c),t=!1;break}if(o!==null&&o>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,c,o),t=!1;break}o=c}if(s!==void 0&&X_(s))for(let a=0,c=s.length;a!==c;++a){let h=s[a];if(isNaN(h)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,h),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Xa,r=t.length-1,o=1;for(let a=1;a<r;++a){let c=!1,h=t[a],l=t[a+1];if(h!==l&&(a!==1||h!==t[0]))if(s)c=!0;else{let u=a*n,d=u-n,f=u+n;for(let p=0;p!==n;++p){let x=e[u+p];if(x!==e[d+p]||x!==e[f+p]){c=!0;break}}}if(c){if(a!==o){t[o]=t[a];let u=a*n,d=o*n;for(let f=0;f!==n;++f)e[d+f]=e[u+f]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,c=o*n,h=0;h!==n;++h)e[c+h]=e[a+h];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};Mn.prototype.TimeBufferType=Float32Array;Mn.prototype.ValueBufferType=Float32Array;Mn.prototype.DefaultInterpolation=cc;var Si=class extends Mn{constructor(t,e,n){super(t,e,n)}};Si.prototype.ValueTypeName="bool";Si.prototype.ValueBufferType=Array;Si.prototype.DefaultInterpolation=Po;Si.prototype.InterpolantFactoryMethodLinear=void 0;Si.prototype.InterpolantFactoryMethodSmooth=void 0;var Qo=class extends Mn{};Qo.prototype.ValueTypeName="color";var Ns=class extends Mn{};Ns.prototype.ValueTypeName="number";var Fc=class extends Us{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-e)/(s-e),h=t*a;for(let l=h+a;h!==l;h+=4)ke.slerpFlat(r,0,o,h-a,o,h,c);return r}},ri=class extends Mn{InterpolantFactoryMethodLinear(t){return new Fc(this.times,this.values,this.getValueSize(),t)}};ri.prototype.ValueTypeName="quaternion";ri.prototype.InterpolantFactoryMethodSmooth=void 0;var wi=class extends Mn{constructor(t,e,n){super(t,e,n)}};wi.prototype.ValueTypeName="string";wi.prototype.ValueBufferType=Array;wi.prototype.DefaultInterpolation=Po;wi.prototype.InterpolantFactoryMethodLinear=void 0;wi.prototype.InterpolantFactoryMethodSmooth=void 0;var Ei=class extends Mn{};Ei.prototype.ValueTypeName="vector";var Fs=class{constructor(t="",e=-1,n=[],s=nh){this.name=t,this.tracks=n,this.duration=e,this.blendMode=s,this.uuid=ai(),this.duration<0&&this.resetDuration()}static parse(t){let e=[],n=t.tracks,s=1/(t.fps||1);for(let o=0,a=n.length;o!==a;++o)e.push(Z_(n[o]).scale(s));let r=new this(t.name,t.duration,e,t.blendMode);return r.uuid=t.uuid,r}static toJSON(t){let e=[],n=t.tracks,s={name:t.name,duration:t.duration,tracks:e,uuid:t.uuid,blendMode:t.blendMode};for(let r=0,o=n.length;r!==o;++r)e.push(Mn.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(t,e,n,s){let r=e.length,o=[];for(let a=0;a<r;a++){let c=[],h=[];c.push((a+r-1)%r,a,(a+1)%r),h.push(0,1,0);let l=q_(c);c=rd(c,1,l),h=rd(h,1,l),!s&&c[0]===0&&(c.push(r),h.push(h[0])),o.push(new Ns(".morphTargetInfluences["+e[a].name+"]",c,h).scale(1/n))}return new this(t,-1,o)}static findByName(t,e){let n=t;if(!Array.isArray(t)){let s=t;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===e)return n[s];return null}static CreateClipsFromMorphTargetSequences(t,e,n){let s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,c=t.length;a<c;a++){let h=t[a],l=h.name.match(r);if(l&&l.length>1){let u=l[1],d=s[u];d||(s[u]=d=[]),d.push(h)}}let o=[];for(let a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],e,n));return o}static parseAnimation(t,e){if(!t)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;let n=function(u,d,f,p,x){if(f.length!==0){let g=[],m=[];Od(f,g,m,p),g.length!==0&&x.push(new u(d,g,m))}},s=[],r=t.name||"default",o=t.fps||30,a=t.blendMode,c=t.length||-1,h=t.hierarchy||[];for(let u=0;u<h.length;u++){let d=h[u].keys;if(!(!d||d.length===0))if(d[0].morphTargets){let f={},p;for(p=0;p<d.length;p++)if(d[p].morphTargets)for(let x=0;x<d[p].morphTargets.length;x++)f[d[p].morphTargets[x]]=-1;for(let x in f){let g=[],m=[];for(let w=0;w!==d[p].morphTargets.length;++w){let E=d[p];g.push(E.time),m.push(E.morphTarget===x?1:0)}s.push(new Ns(".morphTargetInfluence["+x+"]",g,m))}c=f.length*o}else{let f=".bones["+e[u].name+"]";n(Ei,f+".position",d,"pos",s),n(ri,f+".quaternion",d,"rot",s),n(Ei,f+".scale",d,"scl",s)}}return s.length===0?null:new this(r,c,s,a)}resetDuration(){let t=this.tracks,e=0;for(let n=0,s=t.length;n!==s;++n){let r=this.tracks[n];e=Math.max(e,r.times[r.times.length-1])}return this.duration=e,this}trim(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].trim(0,this.duration);return this}validate(){let t=!0;for(let e=0;e<this.tracks.length;e++)t=t&&this.tracks[e].validate();return t}optimize(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].optimize();return this}clone(){let t=[];for(let e=0;e<this.tracks.length;e++)t.push(this.tracks[e].clone());return new this.constructor(this.name,this.duration,t,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}};function Y_(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Ns;case"vector":case"vector2":case"vector3":case"vector4":return Ei;case"color":return Qo;case"quaternion":return ri;case"bool":case"boolean":return Si;case"string":return wi}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function Z_(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let t=Y_(i.type);if(i.times===void 0){let e=[],n=[];Od(i.keys,e,n,"value"),i.times=e,i.values=n}return t.parse!==void 0?t.parse(i):new t(i.name,i.times,i.values,i.interpolation)}var Oc=class{constructor(t,e,n){let s=this,r=!1,o=0,a=0,c,h=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(l){a++,r===!1&&s.onStart!==void 0&&s.onStart(l,o,a),r=!0},this.itemEnd=function(l){o++,s.onProgress!==void 0&&s.onProgress(l,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(l){s.onError!==void 0&&s.onError(l)},this.resolveURL=function(l){return c?c(l):l},this.setURLModifier=function(l){return c=l,this},this.addHandler=function(l,u){return h.push(l,u),this},this.removeHandler=function(l){let u=h.indexOf(l);return u!==-1&&h.splice(u,2),this},this.getHandler=function(l){for(let u=0,d=h.length;u<d;u+=2){let f=h[u],p=h[u+1];if(f.global&&(f.lastIndex=0),f.test(l))return p}return null}}},$_=new Oc,kc=class{constructor(t){this.manager=t!==void 0?t:$_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}};kc.DEFAULT_MATERIAL_NAME="__DEFAULT";var Os=class extends ze{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Wt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}},ta=class extends Os{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ze.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Wt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}},Sl=new Yt,od=new I,ad=new I,Ar=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new yt(512,512),this.map=null,this.mapPass=null,this.matrix=new Yt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new xr,this._frameExtents=new yt(1,1),this._viewportCount=1,this._viewports=[new ce(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,n=this.matrix;od.setFromMatrixPosition(t.matrixWorld),e.position.copy(od),ad.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(ad),e.updateMatrixWorld(),Sl.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Sl),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Sl)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},zc=class extends Ar{constructor(){super(new Be(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(t){let e=this.camera,n=As*2*t.angle*this.focus,s=this.mapSize.width/this.mapSize.height,r=t.distance||e.far;(n!==e.fov||s!==e.aspect||r!==e.far)&&(e.fov=n,e.aspect=s,e.far=r,e.updateProjectionMatrix()),super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this}},ea=class extends Os{constructor(t,e,n=0,s=Math.PI/3,r=0,o=2){super(t,e),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ze.DEFAULT_UP),this.updateMatrix(),this.target=new ze,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new zc}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}},ld=new Yt,or=new I,wl=new I,Bc=class extends Ar{constructor(){super(new Be(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new yt(4,2),this._viewportCount=6,this._viewports=[new ce(2,1,1,1),new ce(0,1,1,1),new ce(3,1,1,1),new ce(1,1,1,1),new ce(3,0,1,1),new ce(1,0,1,1)],this._cubeDirections=[new I(1,0,0),new I(-1,0,0),new I(0,0,1),new I(0,0,-1),new I(0,1,0),new I(0,-1,0)],this._cubeUps=[new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,0,1),new I(0,0,-1)]}updateMatrices(t,e=0){let n=this.camera,s=this.matrix,r=t.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),or.setFromMatrixPosition(t.matrixWorld),n.position.copy(or),wl.copy(n.position),wl.add(this._cubeDirections[e]),n.up.copy(this._cubeUps[e]),n.lookAt(wl),n.updateMatrixWorld(),s.makeTranslation(-or.x,-or.y,-or.z),ld.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ld)}},ks=class extends Os{constructor(t,e,n=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Bc}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}},Hc=class extends Ar{constructor(){super(new Cs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},na=class extends Os{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ze.DEFAULT_UP),this.updateMatrix(),this.target=new ze,this.shadow=new Hc}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}};var ia=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=cd(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let e=cd();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}};function cd(){return performance.now()}var Vc=class{constructor(t,e,n){this.binding=t,this.valueSize=n;let s,r,o;switch(e){case"quaternion":s=this._slerp,r=this._slerpAdditive,o=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":s=this._select,r=this._select,o=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:s=this._lerp,r=this._lerpAdditive,o=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=s,this._mixBufferRegionAdditive=r,this._setIdentity=o,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(t,e){let n=this.buffer,s=this.valueSize,r=t*s+s,o=this.cumulativeWeight;if(o===0){for(let a=0;a!==s;++a)n[r+a]=n[a];o=e}else{o+=e;let a=e/o;this._mixBufferRegion(n,r,0,a,s)}this.cumulativeWeight=o}accumulateAdditive(t){let e=this.buffer,n=this.valueSize,s=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(e,s,0,t,n),this.cumulativeWeightAdditive+=t}apply(t){let e=this.valueSize,n=this.buffer,s=t*e+e,r=this.cumulativeWeight,o=this.cumulativeWeightAdditive,a=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){let c=e*this._origIndex;this._mixBufferRegion(n,s,c,1-r,e)}o>0&&this._mixBufferRegionAdditive(n,s,this._addIndex*e,1,e);for(let c=e,h=e+e;c!==h;++c)if(n[c]!==n[c+e]){a.setValue(n,s);break}}saveOriginalState(){let t=this.binding,e=this.buffer,n=this.valueSize,s=n*this._origIndex;t.getValue(e,s);for(let r=n,o=s;r!==o;++r)e[r]=e[s+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){let t=this.valueSize*3;this.binding.setValue(this.buffer,t)}_setAdditiveIdentityNumeric(){let t=this._addIndex*this.valueSize,e=t+this.valueSize;for(let n=t;n<e;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){let t=this._origIndex*this.valueSize,e=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[e+n]=this.buffer[t+n]}_select(t,e,n,s,r){if(s>=.5)for(let o=0;o!==r;++o)t[e+o]=t[n+o]}_slerp(t,e,n,s){ke.slerpFlat(t,e,t,e,t,n,s)}_slerpAdditive(t,e,n,s,r){let o=this._workIndex*r;ke.multiplyQuaternionsFlat(t,o,t,e,t,n),ke.slerpFlat(t,e,t,e,t,o,s)}_lerp(t,e,n,s,r){let o=1-s;for(let a=0;a!==r;++a){let c=e+a;t[c]=t[c]*o+t[n+a]*s}}_lerpAdditive(t,e,n,s,r){for(let o=0;o!==r;++o){let a=e+o;t[a]=t[a]+t[n+o]*s}}},oh="\\[\\]\\.:\\/",J_=new RegExp("["+oh+"]","g"),ah="[^"+oh+"]",K_="[^"+oh.replace("\\.","")+"]",j_=/((?:WC+[\/:])*)/.source.replace("WC",ah),Q_=/(WCOD+)?/.source.replace("WCOD",K_),tv=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ah),ev=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ah),nv=new RegExp("^"+j_+Q_+tv+ev+"$"),iv=["material","materials","bones","map"],Gc=class{constructor(t,e,n){let s=n||Se.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},Se=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(J_,"")}static parseTrackName(t){let e=nv.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);iv.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let c=n(a.children);if(c)return c}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let h=e.objectIndex;switch(n){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let l=0;l<t.length;l++)if(t[l].name===h){h=l;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(h!==void 0){if(t[h]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[h]}}let o=t[s];if(o===void 0){let h=e.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+h+"."+s+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:t.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Se.Composite=Gc;Se.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Se.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Se.prototype.GetterByBindingType=[Se.prototype._getValue_direct,Se.prototype._getValue_array,Se.prototype._getValue_arrayElement,Se.prototype._getValue_toArray];Se.prototype.SetterByBindingTypeAndVersioning=[[Se.prototype._setValue_direct,Se.prototype._setValue_direct_setNeedsUpdate,Se.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Se.prototype._setValue_array,Se.prototype._setValue_array_setNeedsUpdate,Se.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Se.prototype._setValue_arrayElement,Se.prototype._setValue_arrayElement_setNeedsUpdate,Se.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Se.prototype._setValue_fromArray,Se.prototype._setValue_fromArray_setNeedsUpdate,Se.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Wc=class{constructor(t,e,n=null,s=e.blendMode){this._mixer=t,this._clip=e,this._localRoot=n,this.blendMode=s;let r=e.tracks,o=r.length,a=new Array(o),c={endingStart:ps,endingEnd:ps};for(let h=0;h!==o;++h){let l=r[h].createInterpolant(null);a[h]=l,l.settings=c}this._interpolantSettings=c,this._interpolants=a,this._propertyBindings=new Array(o),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=eh,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(t){return this._startTime=t,this}setLoop(t,e){return this.loop=t,this.repetitions=e,this}setEffectiveWeight(t){return this.weight=t,this._effectiveWeight=this.enabled?t:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(t){return this._scheduleFading(t,0,1)}fadeOut(t){return this._scheduleFading(t,1,0)}crossFadeFrom(t,e,n){if(t.fadeOut(e),this.fadeIn(e),n){let s=this._clip.duration,r=t._clip.duration,o=r/s,a=s/r;t.warp(1,o,e),this.warp(a,1,e)}return this}crossFadeTo(t,e,n){return t.crossFadeFrom(this,e,n)}stopFading(){let t=this._weightInterpolant;return t!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(t)),this}setEffectiveTimeScale(t){return this.timeScale=t,this._effectiveTimeScale=this.paused?0:t,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(t){return this.timeScale=this._clip.duration/t,this.stopWarping()}syncWith(t){return this.time=t.time,this.timeScale=t.timeScale,this.stopWarping()}halt(t){return this.warp(this._effectiveTimeScale,0,t)}warp(t,e,n){let s=this._mixer,r=s.time,o=this.timeScale,a=this._timeScaleInterpolant;a===null&&(a=s._lendControlInterpolant(),this._timeScaleInterpolant=a);let c=a.parameterPositions,h=a.sampleValues;return c[0]=r,c[1]=r+n,h[0]=t/o,h[1]=e/o,this}stopWarping(){let t=this._timeScaleInterpolant;return t!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(t)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(t,e,n,s){if(!this.enabled){this._updateWeight(t);return}let r=this._startTime;if(r!==null){let c=(t-r)*n;c<0||n===0?e=0:(this._startTime=null,e=n*c)}e*=this._updateTimeScale(t);let o=this._updateTime(e),a=this._updateWeight(t);if(a>0){let c=this._interpolants,h=this._propertyBindings;switch(this.blendMode){case Yf:for(let l=0,u=c.length;l!==u;++l)c[l].evaluate(o),h[l].accumulateAdditive(a);break;case nh:default:for(let l=0,u=c.length;l!==u;++l)c[l].evaluate(o),h[l].accumulate(s,a)}}}_updateWeight(t){let e=0;if(this.enabled){e=this.weight;let n=this._weightInterpolant;if(n!==null){let s=n.evaluate(t)[0];e*=s,t>n.parameterPositions[1]&&(this.stopFading(),s===0&&(this.enabled=!1))}}return this._effectiveWeight=e,e}_updateTimeScale(t){let e=0;if(!this.paused){e=this.timeScale;let n=this._timeScaleInterpolant;if(n!==null){let s=n.evaluate(t)[0];e*=s,t>n.parameterPositions[1]&&(this.stopWarping(),e===0?this.paused=!0:this.timeScale=e)}}return this._effectiveTimeScale=e,e}_updateTime(t){let e=this._clip.duration,n=this.loop,s=this.time+t,r=this._loopCount,o=n===qf;if(t===0)return r===-1?s:o&&(r&1)===1?e-s:s;if(n===la){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));t:{if(s>=e)s=e;else if(s<0)s=0;else{this.time=s;break t}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:t<0?-1:1})}}else{if(r===-1&&(t>=0?(r=0,this._setEndings(!0,this.repetitions===0,o)):this._setEndings(this.repetitions===0,!0,o)),s>=e||s<0){let a=Math.floor(s/e);s-=e*a,r+=Math.abs(a);let c=this.repetitions-r;if(c<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,s=t>0?e:0,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:t>0?1:-1});else{if(c===1){let h=t<0;this._setEndings(h,!h,o)}else this._setEndings(!1,!1,o);this._loopCount=r,this.time=s,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:a})}}else this.time=s;if(o&&(r&1)===1)return e-s}return s}_setEndings(t,e,n){let s=this._interpolantSettings;n?(s.endingStart=ms,s.endingEnd=ms):(t?s.endingStart=this.zeroSlopeAtStart?ms:ps:s.endingStart=Io,e?s.endingEnd=this.zeroSlopeAtEnd?ms:ps:s.endingEnd=Io)}_scheduleFading(t,e,n){let s=this._mixer,r=s.time,o=this._weightInterpolant;o===null&&(o=s._lendControlInterpolant(),this._weightInterpolant=o);let a=o.parameterPositions,c=o.sampleValues;return a[0]=r,c[0]=e,a[1]=r+t,c[1]=n,this}},sv=new Float32Array(1),sa=class extends kn{constructor(t){super(),this._root=t,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(t,e){let n=t._localRoot||this._root,s=t._clip.tracks,r=s.length,o=t._propertyBindings,a=t._interpolants,c=n.uuid,h=this._bindingsByRootAndName,l=h[c];l===void 0&&(l={},h[c]=l);for(let u=0;u!==r;++u){let d=s[u],f=d.name,p=l[f];if(p!==void 0)++p.referenceCount,o[u]=p;else{if(p=o[u],p!==void 0){p._cacheIndex===null&&(++p.referenceCount,this._addInactiveBinding(p,c,f));continue}let x=e&&e._propertyBindings[u].binding.parsedPath;p=new Vc(Se.create(n,f,x),d.ValueTypeName,d.getValueSize()),++p.referenceCount,this._addInactiveBinding(p,c,f),o[u]=p}a[u].resultBuffer=p.buffer}}_activateAction(t){if(!this._isActiveAction(t)){if(t._cacheIndex===null){let n=(t._localRoot||this._root).uuid,s=t._clip.uuid,r=this._actionsByClip[s];this._bindAction(t,r&&r.knownActions[0]),this._addInactiveAction(t,s,n)}let e=t._propertyBindings;for(let n=0,s=e.length;n!==s;++n){let r=e[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(t)}}_deactivateAction(t){if(this._isActiveAction(t)){let e=t._propertyBindings;for(let n=0,s=e.length;n!==s;++n){let r=e[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(t)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;let t=this;this.stats={actions:{get total(){return t._actions.length},get inUse(){return t._nActiveActions}},bindings:{get total(){return t._bindings.length},get inUse(){return t._nActiveBindings}},controlInterpolants:{get total(){return t._controlInterpolants.length},get inUse(){return t._nActiveControlInterpolants}}}}_isActiveAction(t){let e=t._cacheIndex;return e!==null&&e<this._nActiveActions}_addInactiveAction(t,e,n){let s=this._actions,r=this._actionsByClip,o=r[e];if(o===void 0)o={knownActions:[t],actionByRoot:{}},t._byClipCacheIndex=0,r[e]=o;else{let a=o.knownActions;t._byClipCacheIndex=a.length,a.push(t)}t._cacheIndex=s.length,s.push(t),o.actionByRoot[n]=t}_removeInactiveAction(t){let e=this._actions,n=e[e.length-1],s=t._cacheIndex;n._cacheIndex=s,e[s]=n,e.pop(),t._cacheIndex=null;let r=t._clip.uuid,o=this._actionsByClip,a=o[r],c=a.knownActions,h=c[c.length-1],l=t._byClipCacheIndex;h._byClipCacheIndex=l,c[l]=h,c.pop(),t._byClipCacheIndex=null;let u=a.actionByRoot,d=(t._localRoot||this._root).uuid;delete u[d],c.length===0&&delete o[r],this._removeInactiveBindingsForAction(t)}_removeInactiveBindingsForAction(t){let e=t._propertyBindings;for(let n=0,s=e.length;n!==s;++n){let r=e[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(t){let e=this._actions,n=t._cacheIndex,s=this._nActiveActions++,r=e[s];t._cacheIndex=s,e[s]=t,r._cacheIndex=n,e[n]=r}_takeBackAction(t){let e=this._actions,n=t._cacheIndex,s=--this._nActiveActions,r=e[s];t._cacheIndex=s,e[s]=t,r._cacheIndex=n,e[n]=r}_addInactiveBinding(t,e,n){let s=this._bindingsByRootAndName,r=this._bindings,o=s[e];o===void 0&&(o={},s[e]=o),o[n]=t,t._cacheIndex=r.length,r.push(t)}_removeInactiveBinding(t){let e=this._bindings,n=t.binding,s=n.rootNode.uuid,r=n.path,o=this._bindingsByRootAndName,a=o[s],c=e[e.length-1],h=t._cacheIndex;c._cacheIndex=h,e[h]=c,e.pop(),delete a[r],Object.keys(a).length===0&&delete o[s]}_lendBinding(t){let e=this._bindings,n=t._cacheIndex,s=this._nActiveBindings++,r=e[s];t._cacheIndex=s,e[s]=t,r._cacheIndex=n,e[n]=r}_takeBackBinding(t){let e=this._bindings,n=t._cacheIndex,s=--this._nActiveBindings,r=e[s];t._cacheIndex=s,e[s]=t,r._cacheIndex=n,e[n]=r}_lendControlInterpolant(){let t=this._controlInterpolants,e=this._nActiveControlInterpolants++,n=t[e];return n===void 0&&(n=new jo(new Float32Array(2),new Float32Array(2),1,sv),n.__cacheIndex=e,t[e]=n),n}_takeBackControlInterpolant(t){let e=this._controlInterpolants,n=t.__cacheIndex,s=--this._nActiveControlInterpolants,r=e[s];t.__cacheIndex=s,e[s]=t,r.__cacheIndex=n,e[n]=r}clipAction(t,e,n){let s=e||this._root,r=s.uuid,o=typeof t=="string"?Fs.findByName(s,t):t,a=o!==null?o.uuid:t,c=this._actionsByClip[a],h=null;if(n===void 0&&(o!==null?n=o.blendMode:n=nh),c!==void 0){let u=c.actionByRoot[r];if(u!==void 0&&u.blendMode===n)return u;h=c.knownActions[0],o===null&&(o=h._clip)}if(o===null)return null;let l=new Wc(this,o,e,n);return this._bindAction(l,h),this._addInactiveAction(l,a,r),l}existingAction(t,e){let n=e||this._root,s=n.uuid,r=typeof t=="string"?Fs.findByName(n,t):t,o=r?r.uuid:t,a=this._actionsByClip[o];return a!==void 0&&a.actionByRoot[s]||null}stopAllAction(){let t=this._actions,e=this._nActiveActions;for(let n=e-1;n>=0;--n)t[n].stop();return this}update(t){t*=this.timeScale;let e=this._actions,n=this._nActiveActions,s=this.time+=t,r=Math.sign(t),o=this._accuIndex^=1;for(let h=0;h!==n;++h)e[h]._update(s,t,r,o);let a=this._bindings,c=this._nActiveBindings;for(let h=0;h!==c;++h)a[h].apply(o);return this}setTime(t){this.time=0;for(let e=0;e<this._actions.length;e++)this._actions[e].time=0;return this.update(t)}getRoot(){return this._root}uncacheClip(t){let e=this._actions,n=t.uuid,s=this._actionsByClip,r=s[n];if(r!==void 0){let o=r.knownActions;for(let a=0,c=o.length;a!==c;++a){let h=o[a];this._deactivateAction(h);let l=h._cacheIndex,u=e[e.length-1];h._cacheIndex=null,h._byClipCacheIndex=null,u._cacheIndex=l,e[l]=u,e.pop(),this._removeInactiveBindingsForAction(h)}delete s[n]}}uncacheRoot(t){let e=t.uuid,n=this._actionsByClip;for(let o in n){let a=n[o].actionByRoot,c=a[e];c!==void 0&&(this._deactivateAction(c),this._removeInactiveAction(c))}let s=this._bindingsByRootAndName,r=s[e];if(r!==void 0)for(let o in r){let a=r[o];a.restoreOriginalState(),this._removeInactiveBinding(a)}}uncacheAction(t,e){let n=this.existingAction(t,e);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}};var hd=new Yt,ra=class{constructor(t,e,n=0,s=1/0){this.ray=new Vi(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new gr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return hd.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(hd),this}intersectObject(t,e=!0,n=[]){return Xc(t,this,n,e),n.sort(ud),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)Xc(t[s],this,n,e);return n.sort(ud),n}};function ud(i,t){return i.distance-t.distance}function Xc(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let o=0,a=r.length;o<a;o++)Xc(r[o],t,e,!0)}}var Rr=class{constructor(t=1,e=0,n=0){return this.radius=t,this.phi=e,this.theta=n,this}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(De(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var oa=class extends kn{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");var kd={type:"change"},ch={type:"start"},Bd={type:"end"},da=new Vi,zd=new hn,rv=Math.cos(70*Bn.DEG2RAD),Ne=new I,nn=2*Math.PI,ve={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},lh=1e-6,fa=class extends oa{constructor(t,e=null){super(t,e),this.state=ve.NONE,this.enabled=!0,this.target=new I,this.cursor=new I,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Xi.ROTATE,MIDDLE:Xi.DOLLY,RIGHT:Xi.PAN},this.touches={ONE:qi.ROTATE,TWO:qi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new I,this._lastQuaternion=new ke,this._lastTargetPosition=new I,this._quat=new ke().setFromUnitVectors(t.up,new I(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Rr,this._sphericalDelta=new Rr,this._scale=1,this._panOffset=new I,this._rotateStart=new yt,this._rotateEnd=new yt,this._rotateDelta=new yt,this._panStart=new yt,this._panEnd=new yt,this._panDelta=new yt,this._dollyStart=new yt,this._dollyEnd=new yt,this._dollyDelta=new yt,this._dollyDirection=new I,this._mouse=new yt,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=av.bind(this),this._onPointerDown=ov.bind(this),this._onPointerUp=lv.bind(this),this._onContextMenu=mv.bind(this),this._onMouseWheel=uv.bind(this),this._onKeyDown=dv.bind(this),this._onTouchStart=fv.bind(this),this._onTouchMove=pv.bind(this),this._onMouseDown=cv.bind(this),this._onMouseMove=hv.bind(this),this._interceptControlDown=gv.bind(this),this._interceptControlUp=xv.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(kd),this.update(),this.state=ve.NONE}update(t=null){let e=this.object.position;Ne.copy(e).sub(this.target),Ne.applyQuaternion(this._quat),this._spherical.setFromVector3(Ne),this.autoRotate&&this.state===ve.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=nn:n>Math.PI&&(n-=nn),s<-Math.PI?s+=nn:s>Math.PI&&(s-=nn),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Ne.setFromSpherical(this._spherical),Ne.applyQuaternion(this._quatInverse),e.copy(this.target).add(Ne),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=Ne.length();o=this._clampDistance(a*this._scale);let c=a-o;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){let a=new I(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;let h=new I(this._mouse.x,this._mouse.y,0);h.unproject(this.object),this.object.position.sub(h).add(a),this.object.updateMatrixWorld(),o=Ne.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(da.origin.copy(this.object.position),da.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(da.direction))<rv?this.object.lookAt(this.target):(zd.setFromNormalAndCoplanarPoint(this.object.up,this.target),da.intersectPlane(zd,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>lh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>lh||this._lastTargetPosition.distanceToSquared(this.target)>lh?(this.dispatchEvent(kd),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?nn/60*this.autoRotateSpeed*t:nn/60/60*this.autoRotateSpeed}_getZoomScale(t){let e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){Ne.setFromMatrixColumn(e,0),Ne.multiplyScalar(-t),this._panOffset.add(Ne)}_panUp(t,e){this.screenSpacePanning===!0?Ne.setFromMatrixColumn(e,1):(Ne.setFromMatrixColumn(e,0),Ne.crossVectors(this.object.up,Ne)),Ne.multiplyScalar(t),this._panOffset.add(Ne)}_pan(t,e){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Ne.copy(s).sub(this.target);let r=Ne.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/n.clientHeight,this.object.matrix),this._panUp(2*e*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=t-n.left,r=e-n.top,o=n.width,a=n.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(nn*this._rotateDelta.x/e.clientHeight),this._rotateUp(nn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateUp(nn*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateUp(-nn*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateLeft(nn*this.rotateSpeed/this.domElement.clientHeight):this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateLeft(-nn*this.rotateSpeed/this.domElement.clientHeight):this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),r=.5*(t.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(nn*this._rotateDelta.x/e.clientHeight),this._rotateUp(nn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(t.pageX+e.x)*.5,a=(t.pageY+e.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new yt,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){let e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function ov(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i)))}function av(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function lv(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Bd),this.state=ve.NONE;break;case 1:let t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function cv(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Xi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=ve.DOLLY;break;case Xi.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=ve.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=ve.ROTATE}break;case Xi.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=ve.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=ve.PAN}break;default:this.state=ve.NONE}this.state!==ve.NONE&&this.dispatchEvent(ch)}function hv(i){switch(this.state){case ve.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case ve.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case ve.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function uv(i){this.enabled===!1||this.enableZoom===!1||this.state!==ve.NONE||(i.preventDefault(),this.dispatchEvent(ch),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Bd))}function dv(i){this.enabled===!1||this.enablePan===!1||this._handleKeyDown(i)}function fv(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case qi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=ve.TOUCH_ROTATE;break;case qi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=ve.TOUCH_PAN;break;default:this.state=ve.NONE}break;case 2:switch(this.touches.TWO){case qi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=ve.TOUCH_DOLLY_PAN;break;case qi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=ve.TOUCH_DOLLY_ROTATE;break;default:this.state=ve.NONE}break;default:this.state=ve.NONE}this.state!==ve.NONE&&this.dispatchEvent(ch)}function pv(i){switch(this._trackPointer(i),this.state){case ve.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case ve.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case ve.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case ve.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=ve.NONE}}function mv(i){this.enabled!==!1&&i.preventDefault()}function gv(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function xv(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var pa=class extends bi{constructor(){super();let t=new en;t.deleteAttribute("uv");let e=new le({side:Ge}),n=new le,s=new ks(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new qt(t,e);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let o=new qt(t,n);o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),this.add(o);let a=new qt(t,n);a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),this.add(a);let c=new qt(t,n);c.position.set(6.167,.857,7.803),c.rotation.set(0,.561,0),c.scale.set(3.927,6.285,3.687),this.add(c);let h=new qt(t,n);h.position.set(-2.017,.018,6.124),h.rotation.set(0,.333,0),h.scale.set(2.002,4.566,2.064),this.add(h);let l=new qt(t,n);l.position.set(2.291,-.756,-2.621),l.rotation.set(0,-.286,0),l.scale.set(1.546,1.552,1.496),this.add(l);let u=new qt(t,n);u.position.set(-2.193,-.369,-5.547),u.rotation.set(0,.516,0),u.scale.set(3.875,3.487,2.986),this.add(u);let d=new qt(t,Hs(50));d.position.set(-16.116,14.37,8.208),d.scale.set(.1,2.428,2.739),this.add(d);let f=new qt(t,Hs(50));f.position.set(-16.109,18.021,-8.207),f.scale.set(.1,2.425,2.751),this.add(f);let p=new qt(t,Hs(17));p.position.set(14.904,12.198,-1.832),p.scale.set(.15,4.265,6.331),this.add(p);let x=new qt(t,Hs(43));x.position.set(-.462,8.89,14.52),x.scale.set(4.38,5.441,.088),this.add(x);let g=new qt(t,Hs(20));g.position.set(3.235,11.486,-12.541),g.scale.set(2.5,2,.1),this.add(g);let m=new qt(t,Hs(100));m.position.set(0,20,0),m.scale.set(1,.1,1),this.add(m)}dispose(){let t=new Set;this.traverse(e=>{e.isMesh&&(t.add(e.geometry),t.add(e.material))});for(let e of t)e.dispose()}};function Hs(i){let t=new Ee;return t.color.setScalar(i),t}var Cr=class{constructor(t){let n=new DataView(t).getUint32(0,!0);this.index=JSON.parse(new TextDecoder().decode(new Uint8Array(t,4,n))).files,this.base=4+n,this.ab=t,this._json=new Map}has(t){return!!this.index[t]}list(t){return Object.keys(this.index).filter(e=>e.startsWith(t))}buf(t){let e=this.index[t];if(!e)throw new Error("pack: missing "+t);return this.ab.slice(this.base+e[0],this.base+e[0]+e[1])}json(t){return this._json.has(t)||this._json.set(t,JSON.parse(new TextDecoder().decode(this.buf(t)))),this._json.get(t)}blob(t,e){return new Blob([this.buf(t)],{type:e})}};async function Hd(i){let t=atob(i),e=new Uint8Array(t.length);for(let r=0;r<t.length;r++)e[r]=t.charCodeAt(r);let n=new DecompressionStream("gzip"),s=await new Response(new Blob([e]).stream().pipeThrough(n)).arrayBuffer();return new Cr(s)}var hh=new Map,Pr={max:0};async function Ir(i,t,{srgb:e=!0}={}){if(hh.has(t))return hh.get(t);let n=t.endsWith(".png")?"image/png":t.endsWith(".jpg")?"image/jpeg":"image/webp",s=await createImageBitmap(i.blob(t,n),{premultiplyAlpha:"none",colorSpaceConversion:"none"});if(Pr.max&&Math.max(s.width,s.height)>Pr.max)try{let o=Pr.max/Math.max(s.width,s.height),a=await createImageBitmap(s,{resizeWidth:Math.round(s.width*o),resizeHeight:Math.round(s.height*o),resizeQuality:"high",premultiplyAlpha:"none",colorSpaceConversion:"none"});s.close(),s=a}catch{}let r=new We(s);return r.flipY=!1,e&&(r.colorSpace=Pe),r.anisotropy=8,r.generateMipmaps=!0,r.minFilter=jn,r.wrapS=r.wrapT=On,r.needsUpdate=!0,hh.set(t,r),r}var uh=new Map;async function Vd(i,t){if(uh.has(t))return uh.get(t);let e=`av/${t}/`,n=i.json(e+"meta.json"),s=new Xe;s.setAttribute("position",new Te(new Float32Array(i.buf(e+"pos.f32")),3)),s.setAttribute("normal",new Te(new Int8Array(i.buf(e+"nor.i8")),3,!0)),s.setAttribute("uv",new Te(new Float32Array(i.buf(e+"uv.f32")),2)),s.setAttribute("skinIndex",new Te(new Uint8Array(i.buf(e+"si.u8")),4)),s.setAttribute("skinWeight",new Te(new Uint8Array(i.buf(e+"sw.u8")),4,!0));let r=i.buf(e+"idx.bin");s.setIndex(new Te(n.index32?new Uint32Array(r):new Uint16Array(r),1)),n.groups.forEach(c=>s.addGroup(c.start,c.count,c.mat));let o=[];for(let c of n.mats){let h=/glasses/.test(c)?"glasses":/opacity/.test(c)?"hair":/head/.test(c)?"head":"body",l=await Ir(i,`${e}${h}.webp`),u=new le({map:l,roughness:h==="head"?.62:.82,metalness:0,name:h});h==="hair"&&(u.alphaTest=.42,u.side=Oe,u.roughness=.7,u.alphaToCoverage=!0),h==="glasses"&&(u.transparent=!0,u.depthWrite=!1,u.side=Oe,u.roughness=.2),o.push(u)}let a={name:t,meta:n,geometry:s,materials:o,inv:new Float32Array(i.buf(e+"inv.f32"))};return uh.set(t,a),a}function Gd(i){let t=i.meta,e=new ie;e.name="rig:"+i.name;let n=t.bones.map(l=>{let u=new _r;return u.name=l.name,u.position.fromArray(l.p),u.quaternion.fromArray(l.q),u.scale.fromArray(l.s),u});t.bones.forEach((l,u)=>{(l.parent<0?e:n[l.parent]).add(n[u])});let s=t.skel.map(l=>n[l]),r=s.map((l,u)=>new Yt().fromArray(i.inv,u*16)),o=new Vo(s,r),a=new Ho(i.geometry,i.materials);a.matrix.fromArray(t.meshMatrix),a.matrix.decompose(a.position,a.quaternion,a.scale),e.add(a),a.bind(o,new Yt().fromArray(t.bindMatrix)),a.frustumCulled=!1,a.castShadow=!0,a.receiveShadow=!1,e.scale.setScalar(.01);let c=new Map(n.map(l=>[l.name,l])),h=new Map(t.bones.map(l=>[l.name,{p:new I().fromArray(l.p),q:new ke().fromArray(l.q)}]));return{rig:e,mesh:a,skeleton:o,bones:c,rest:h,height:t.height*.01,template:i}}var dh=new Map;function Wd(i,t,e={}){let n=t+(e.inplace?":ip":"");if(dh.has(n))return dh.get(n);let s=`an/${t}/`,r=i.json(s+"meta.json"),o=new Int16Array(i.buf(s+"q.i16")),a=new Float32Array(i.buf(s+"root.f32")),c=r.frames,h=r.bones.length,l=new Float32Array(c);for(let x=0;x<c;x++)l[x]=Math.min(x/r.fps,r.duration);let u=[];for(let x=0;x<h;x++){let g=new Float32Array(c*4);for(let m=0;m<c;m++){let w=(m*h+x)*4;g[m*4]=o[w]/32767,g[m*4+1]=o[w+1]/32767,g[m*4+2]=o[w+2]/32767,g[m*4+3]=o[w+3]/32767}u.push(new ri(r.bones[x]+".quaternion",l,g))}let d=[a[(c-1)*3]-a[0],0,a[(c-1)*3+2]-a[2]],f=new Float32Array(a);if(e.inplace)for(let x=0;x<c;x++){let g=x/(c-1);f[x*3]-=d[0]*g,f[x*3+2]-=d[2]*g}if(u.push(new Ei("Bip01.position",l,f)),!e.noFingers)for(let[x,g]of Object.entries(r.fingers))u.push(new ri(x+".quaternion",[0],g));let p=new Fs(t,r.duration,u);return p.userData={drift:d,speed:Math.hypot(d[0],d[2])*.01/r.duration,root0:r.root0,rootEnd:r.rootEnd,face:r.face},dh.set(n,p),p}function fh(i,t=!1){let e=i[0].index!==null,n=new Set(Object.keys(i[0].attributes)),s=new Set(Object.keys(i[0].morphAttributes)),r={},o={},a=i[0].morphTargetsRelative,c=new Xe,h=0;for(let l=0;l<i.length;++l){let u=i[l],d=0;if(e!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in u.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in u.morphAttributes){if(!s.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(u.morphAttributes[f])}if(t){let f;if(e)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". The geometry must have either an index or a position attribute"),null;c.addGroup(h,f,l),h+=f}}if(e){let l=0,u=[];for(let d=0;d<i.length;++d){let f=i[d].index;for(let p=0;p<f.count;++p)u.push(f.getX(p)+l);l+=i[d].attributes.position.count}c.setIndex(u)}for(let l in r){let u=Xd(r[l]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+l+" attribute."),null;c.setAttribute(l,u)}for(let l in o){let u=o[l][0].length;if(u===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[l]=[];for(let d=0;d<u;++d){let f=[];for(let x=0;x<o[l].length;++x)f.push(o[l][x][d]);let p=Xd(f);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+l+" morphAttribute."),null;c.morphAttributes[l].push(p)}}return c}function Xd(i){let t,e,n,s=-1,r=0;for(let h=0;h<i.length;++h){let l=i[h];if(t===void 0&&(t=l.array.constructor),t!==l.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=l.itemSize),e!==l.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=l.normalized),n!==l.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=l.gpuType),s!==l.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=l.count*e}let o=new t(r),a=new Te(o,e,n),c=0;for(let h=0;h<i.length;++h){let l=i[h];if(l.isInterleavedBufferAttribute){let u=c/e;for(let d=0,f=l.count;d<f;d++)for(let p=0;p<e;p++){let x=l.getComponent(d,p);a.setComponent(d+u,p,x)}}else o.set(l.array,c);c+=l.count*e}return s!==void 0&&(a.gpuType=s),a}var li='"Segoe UI Variable Display","Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif',_v='"Cascadia Mono","Cascadia Code",Consolas,"Courier New",monospace';function bn(i){let t=i>>>0||1;return()=>(t^=t<<13,t>>>=0,t^=t>>17,t^=t<<5,t>>>=0,t/4294967296)}function qe(i,t){let e=document.createElement("canvas");return e.width=i,e.height=t,e}function un(i,{repeat:t,srgb:e=!0,aniso:n=8}={}){let s=new Go(i);return e&&(s.colorSpace=Pe),s.anisotropy=n,t&&(s.wrapS=s.wrapT=On,s.repeat.set(t[0],t[1])),s}function Pn(i,t,e,n,s,r){i.beginPath(),i.moveTo(t+r,e),i.arcTo(t+n,e,t+n,e+s,r),i.arcTo(t+n,e+s,t,e+s,r),i.arcTo(t,e+s,t,e,r),i.arcTo(t,e,t+n,e,r),i.closePath()}function ma(i,t=1,e=!0){let n=qe(256,256),s=n.getContext("2d"),r=bn(t);s.fillStyle=i,s.fillRect(0,0,256,256);let o=s.getImageData(0,0,256,256),a=o.data;for(let c=0;c<a.length;c+=4){let h=(r()-.5)*26;a[c]+=h,a[c+1]+=h,a[c+2]+=h}return s.putImageData(o,0,0),e&&(s.strokeStyle="rgba(0,0,0,0.10)",s.lineWidth=2,s.strokeRect(0,0,256,256),s.strokeStyle="rgba(255,255,255,0.05)",s.strokeRect(2,2,252,252)),n}function qd(i=7){let t=qe(512,512),e=t.getContext("2d"),n=bn(i);e.fillStyle="#e9e7e2",e.fillRect(0,0,512,512);let s=["#c9c4bb","#b5b0a7","#d8d3ca","#a9a39a","#dcc9b6","#bfc5c9","#f4f2ee"];for(let r=0;r<900;r++){e.fillStyle=s[n()*s.length|0],e.globalAlpha=.5+n()*.5;let o=n()*512,a=n()*512,c=1.5+n()*5;e.beginPath(),e.ellipse(o,a,c,c*(.5+n()*.6),n()*3.14,0,6.3),e.fill()}return e.globalAlpha=1,e.strokeStyle="rgba(120,115,105,0.25)",e.lineWidth=2,e.strokeRect(0,0,512,512),t}function ph(i=3,t="#cfd2d4"){let e=qe(512,512),n=e.getContext("2d"),s=bn(i);n.fillStyle=t,n.fillRect(0,0,512,512);for(let r=0;r<260;r++){let o=s()>.5?255:70;n.fillStyle=`rgba(${o},${o},${o+4},${.02+s()*.035})`;let a=20+s()*110;n.beginPath(),n.ellipse(s()*512,s()*512,a,a*(.4+s()*.8),s()*3,0,6.3),n.fill()}return e}function ga(i="#f3f1ec",t="#d7d2c8"){let e=qe(256,256),n=e.getContext("2d");return n.fillStyle=i,n.fillRect(0,0,256,256),n.strokeStyle=t,n.lineWidth=3,n.strokeRect(0,0,256,256),e}function Yd(i="#5a3d2b"){let t=qe(256,256),e=t.getContext("2d"),n=bn(11);e.fillStyle="#1d1512",e.fillRect(0,0,256,256);for(let s=0;s<8;s++){let r=s*32,o=e.createLinearGradient(r,0,r+26,0);o.addColorStop(0,"#3d291c"),o.addColorStop(.25,i),o.addColorStop(.8,i),o.addColorStop(1,"#3a271b"),e.fillStyle=o,e.fillRect(r,0,26,256);for(let a=0;a<14;a++)e.fillStyle=`rgba(0,0,0,${n()*.08})`,e.fillRect(r+n()*26,0,1,256)}return t}function Zd(i=0){let t=qe(512,512),e=t.getContext("2d"),n=bn(5),s=e.createLinearGradient(0,0,0,512);if(i===0?(s.addColorStop(0,"#5fa8e6"),s.addColorStop(.55,"#bfe0f7"),s.addColorStop(.8,"#f1f6f8")):i===1?(s.addColorStop(0,"#3f5fa8"),s.addColorStop(.45,"#e58f7a"),s.addColorStop(.78,"#ffd08a")):(s.addColorStop(0,"#050a16"),s.addColorStop(.6,"#0f1a30"),s.addColorStop(.85,"#1c2a44")),e.fillStyle=s,e.fillRect(0,0,512,512),i===2)for(let o=0;o<90;o++)e.fillStyle=`rgba(255,255,255,${.2+n()*.6})`,e.fillRect(n()*512,n()*300,1.2,1.2);else{e.fillStyle=i===1?"rgba(255,214,190,0.7)":"rgba(255,255,255,0.75)";for(let o=0;o<9;o++){let a=n()*512,c=60+n()*200;for(let h=0;h<7;h++)e.beginPath(),e.ellipse(a+(n()-.5)*90,c+(n()-.5)*18,26+n()*30,9+n()*9,0,0,6.3),e.fill()}}let r=0;for(;r<512;){let o=18+n()*40,a=40+n()*130,c=n();e.fillStyle=i===0?`rgb(${150+c*40},${165+c*35},${182+c*30})`:i===1?`rgb(${88+c*30},${70+c*22},${92+c*26})`:`rgb(${14+c*10},${20+c*12},${34+c*14})`,e.fillRect(r,442-a,o,a+70);for(let h=442-a+6;h<500;h+=9)for(let l=r+3;l<r+o-4;l+=6){let u=n();(i===2?u>.62:u>.45)&&(e.fillStyle=i===0?"rgba(255,255,255,0.35)":i===1?"rgba(255,214,150,0.55)":u>.9?"rgba(160,210,255,0.9)":"rgba(255,214,140,0.9)",e.fillRect(l,h,3,5))}r+=o+2}return e.fillStyle=i===0?"#9fb7a3":i===1?"#5b5a52":"#0b1018",e.fillRect(0,470,512,42),t}function Dr(i,{w:t=1024,h:e=256,bg:n=null,color:s="#1c1f24",size:r=120,weight:o=800,sub:a=null,subColor:c=null,align:h="center",radius:l=0,border:u=null,font:d=li,letter:f=0,pad:p=40}={}){let x=qe(t,e),g=x.getContext("2d");n&&(g.fillStyle=n,l?(Pn(g,0,0,t,e,l),g.fill()):g.fillRect(0,0,t,e)),u&&(g.strokeStyle=u,g.lineWidth=6,Pn(g,3,3,t-6,e-6,Math.max(0,l-3)),g.stroke()),g.fillStyle=s,g.textAlign=h,g.textBaseline="middle";try{g.letterSpacing=f+"px"}catch{}let m=r;for(g.font=`${o} ${m}px ${d}`;g.measureText(i).width>t-p*2&&m>12;)m-=2,g.font=`${o} ${m}px ${d}`;let w=h==="center"?t/2:h==="left"?p:t-p;if(g.fillText(i,w,a?e*.4:e/2+m*.04),a){let E=Math.round(m*.42);for(g.font=`600 ${E}px ${d}`;g.measureText(a).width>t-p*2&&E>10;)E-=1,g.font=`600 ${E}px ${d}`;g.fillStyle=c||s,g.globalAlpha=c?1:.7,g.fillText(a,w,e*.4+m*.78),g.globalAlpha=1}return x}function Yi(i,t,e){let n=qe(i,t),s=n.getContext("2d");return s.fillStyle=e,s.fillRect(0,0,i,t),[n,s]}function Zi(i,t,e,n,s=!0){i.fillStyle=s?"#161a22":"#eef1f5",i.fillRect(0,0,t,34),i.fillStyle=n,i.fillRect(0,0,6,34),i.fillStyle=s?"#d7dde8":"#2a2f38",i.font=`600 17px ${li}`,i.textBaseline="middle",i.textAlign="left",i.fillText(e,18,18),["#ff5f57","#febc2e","#28c840"].forEach((r,o)=>{i.fillStyle=r,i.beginPath(),i.arc(t-22-o*20,17,5.5,0,6.3),i.fill()})}function Hn(i,{seed:t=1,accent:e="#ed3237",title:n=""}={}){let o=bn(t*977+i.length*31);if(i==="terminal"||i==="code"){let[h,l]=Yi(640,360,"#0d1117");Zi(l,640,n||(i==="code"?"editor":"terminal"),e),l.font=`13px ${_v}`,l.textBaseline="top";let u=i==="code"?["#ff7b72","#79c0ff","#d2a8ff","#a5d6ff","#7ee787","#c9d1d9"]:["#7ee787","#c9d1d9","#c9d1d9","#79c0ff","#e3b341"];for(let d=46;d<350;d+=17){let f=14+(i==="code"?(o()*4|0)*18:0);i==="code"&&(l.fillStyle="#484f58",l.fillText(String((d-46)/17+1|0).padStart(3),6,d),f+=30);let p=1+(o()*5|0);for(let x=0;x<p;x++){let g=20+o()*90;if(l.fillStyle=u[o()*u.length|0],l.globalAlpha=.85,l.fillRect(f,d+4,g,7),f+=g+9,f>520)break}}return l.globalAlpha=1,h}if(i==="chart"||i==="prices"){let[h,l]=Yi(640,360,"#ffffff");Zi(l,640,n||"painel",e,!1),l.strokeStyle="#e7eaef",l.lineWidth=1;for(let f=70;f<330;f+=44)l.beginPath(),l.moveTo(40,f),l.lineTo(616,f),l.stroke();let u=i==="prices"?3:1,d=[e,"#2563eb","#94a3b8"];for(let f=0;f<u;f++){l.strokeStyle=d[f],l.lineWidth=f===0?4:2.5,l.beginPath();let p=.35+o()*.3;for(let x=0;x<=24;x++){p=Math.min(.92,Math.max(.12,p+(o()-.46)*.13));let g=40+x*576/24,m=326-p*240;x?l.lineTo(g,m):l.moveTo(g,m)}l.stroke()}if(i==="chart"){for(let f=0;f<12;f++){let p=20+o()*90;l.fillStyle=e,l.globalAlpha=.16,l.fillRect(52+f*48,326-p,30,p)}l.globalAlpha=1}return h}if(i==="sheet"){let[h,l]=Yi(640,360,"#ffffff");Zi(l,640,n||"planilha",e,!1),l.fillStyle="#f3f5f8",l.fillRect(0,34,640,24),l.fillRect(0,34,44,360),l.strokeStyle="#dfe3ea",l.lineWidth=1;for(let u=44;u<640;u+=85)l.beginPath(),l.moveTo(u,34),l.lineTo(u,360),l.stroke();for(let u=58;u<360;u+=22)l.beginPath(),l.moveTo(0,u),l.lineTo(640,u),l.stroke();for(let u=64;u<352;u+=22)for(let d=52;d<610;d+=85)o()>.25&&(l.fillStyle=o()>.85?e:"#5b6472",l.globalAlpha=.75,l.fillRect(d+(o()>.5?0:20),u,26+o()*40,8));return l.globalAlpha=1,h}if(i==="crm"){let[h,l]=Yi(640,360,"#f4f6f9");Zi(l,640,n||"CRM \xB7 funil",e,!1);let u=5,d=610/u,f=["Novos","Atendendo","Or\xE7amento","Fechando","Consignados"];for(let p=0;p<u;p++){let x=15+p*d;l.fillStyle="#e8ecf2",Pn(l,x,46,d-8,302,8),l.fill(),l.fillStyle="#394150",l.font=`700 13px ${li}`,l.textAlign="left",l.textBaseline="top",l.fillText(f[p],x+9,54);let g=2+(o()*4|0);for(let m=0;m<g;m++){let w=78+m*52;l.fillStyle="#fff",Pn(l,x+6,w,d-20,44,6),l.fill(),l.fillStyle=p===3?e:"#25d366",l.fillRect(x+6,w+6,4,32),l.fillStyle="#9aa3b2",l.fillRect(x+18,w+10,d-60,7),l.fillRect(x+18,w+25,d-90,6)}}return h}if(i==="design"){let[h,l]=Yi(640,360,"#23252b");Zi(l,640,n||"est\xFAdio",e),l.fillStyle="#2e3138",l.fillRect(0,34,46,360),l.fillRect(510,34,130,360);for(let d=0;d<8;d++)l.fillStyle="#555b66",Pn(l,12,48+d*34,22,22,5),l.fill();let u=l.createLinearGradient(80,60,480,330);u.addColorStop(0,"#ed3237"),u.addColorStop(.55,"#ff8a3d"),u.addColorStop(1,"#ffd166"),l.fillStyle=u,Pn(l,86,62,390,262,10),l.fill(),l.fillStyle="rgba(255,255,255,0.92)",l.font=`900 46px ${li}`,l.textAlign="left",l.textBaseline="top",l.fillText("PC GAMER",112,92),l.font=`700 22px ${li}`,l.fillText("monte o seu",114,146),l.fillStyle="rgba(20,20,24,0.85)",Pn(l,330,150,120,150,10),l.fill(),l.fillStyle="#7df9ff",l.fillRect(346,170,8,110),l.fillStyle="#ff5fd2",l.fillRect(362,170,8,110);for(let d=0;d<7;d++)l.fillStyle=["#ed3237","#ff8a3d","#ffd166","#06d6a0","#118ab2","#8338ec","#fff"][d],l.fillRect(524+d%4*26,56+(d/4|0)*26,20,20);return h}if(i==="pix"){let[h,l]=Yi(640,360,"#ffffff");Zi(l,640,n||"financeiro",e,!1);for(let u=0;u<3;u++)l.fillStyle="#f3f6f9",Pn(l,18+u*205,50,192,76,10),l.fill(),l.fillStyle="#8a94a3",l.fillRect(34+u*205,66,80,8),l.fillStyle=u===0?e:"#2b3442",l.fillRect(34+u*205,90,120,18);for(let u=0;u<7;u++){let d=144+u*29;l.fillStyle=u%2?"#fafbfc":"#fff",l.fillRect(18,d,604,28),l.fillStyle="#32bcad",l.beginPath(),l.arc(36,d+14,7,0,6.3),l.fill(),l.fillStyle="#6b7482",l.fillRect(56,d+10,150+o()*120,8),l.fillStyle=o()>.2?"#16a34a":"#d97706",l.fillRect(510,d+9,60+o()*30,10)}return h}let[a,c]=Yi(640,360,"#10141c");Zi(c,640,n||"painel",e);for(let h=0;h<6;h++){let l=16+h%3*206,u=48+(h/3|0)*152;c.fillStyle="#1a2130",Pn(c,l,u,196,142,10),c.fill(),c.fillStyle="#7f8aa0",c.fillRect(l+14,u+16,90,7),c.strokeStyle=h%2?"#38bdf8":e,c.lineWidth=3,c.beginPath();let d=.5;for(let f=0;f<=12;f++){d=Math.min(.9,Math.max(.1,d+(o()-.45)*.3));let p=l+14+f*14,x=u+126-d*80;f?c.lineTo(p,x):c.moveTo(p,x)}c.stroke()}return a}function $d(i=1,t="#ed3237"){let e=qe(768,432),n=e.getContext("2d"),s=bn(i);n.fillStyle="#fbfcfd",n.fillRect(0,0,768,432);let r=["#1f2937",t,"#2563eb","#16a34a"];n.lineCap="round";for(let o=0;o<5;o++){let a=60+s()*600,c=60+s()*290,h=80+s()*70,l=44+s()*30;n.strokeStyle=r[s()*4|0],n.lineWidth=4,Pn(n,a,c,h,l,8),n.stroke(),n.lineWidth=3,n.beginPath(),n.moveTo(a+12,c+l/2-6),n.lineTo(a+h-14,c+l/2-6),n.moveTo(a+12,c+l/2+8),n.lineTo(a+h*.6,c+l/2+8),n.stroke(),o&&(n.beginPath(),n.moveTo(a,c+l/2),n.bezierCurveTo(a-60,c,a-80,c+90,a-120+s()*40,c+(s()-.5)*120),n.stroke())}n.strokeStyle=t,n.lineWidth=5,n.beginPath();for(let o=0;o<10;o++){let a=500+o*22,c=380-o*o*2.4-s()*14;o?n.lineTo(a,c):n.moveTo(a,c)}return n.stroke(),e}function Jd(i=1){let t=qe(256,360),e=t.getContext("2d"),n=bn(i*13),s=[["#ed3237","#ffd166","#1c1f24"],["#118ab2","#06d6a0","#f8f9fa"],["#8338ec","#ff5fd2","#0b0d12"],["#ff8a3d","#1c1f24","#fff3e0"]],r=s[n()*s.length|0];return e.fillStyle=r[0],e.fillRect(0,0,256,360),e.fillStyle=r[1],e.beginPath(),e.arc(60+n()*140,110+n()*80,60+n()*50,0,6.3),e.fill(),e.fillStyle=r[2],e.fillRect(24,250,150+n()*50,22),e.fillRect(24,284,90+n()*60,12),e.fillRect(24,304,120,12),t}function Kd(i,t,e){let n=i.getContext("2d"),s=i.width,r=i.height;n.fillStyle="#0c1018",n.fillRect(0,0,s,r),n.strokeStyle="rgba(255,255,255,0.05)",n.lineWidth=1;for(let h=0;h<s;h+=40)n.beginPath(),n.moveTo(h,0),n.lineTo(h,r),n.stroke();for(let h=0;h<r;h+=40)n.beginPath(),n.moveTo(0,h),n.lineTo(s,h),n.stroke();n.fillStyle="#e8edf5",n.font=`800 34px ${li}`,n.textAlign="left",n.textBaseline="top",n.fillText("CENTRAL DE ORQUESTRA\xC7\xC3O",36,26),n.fillStyle="#ed3237",n.fillRect(36,72,120,5);let o=s/2,a=r/2+26,c=Math.min(s,r)*.33;e.forEach((h,l)=>{let u=-Math.PI/2+l*2*Math.PI/e.length,d=o+Math.cos(u)*c*1.55,f=a+Math.sin(u)*c*.92;n.strokeStyle="rgba(255,255,255,0.14)",n.lineWidth=2,n.beginPath(),n.moveTo(o,a),n.lineTo(d,f),n.stroke();let p=(t*.35+l*.37)%1,x=l%2?p:1-p;n.fillStyle=h.color,n.beginPath(),n.arc(o+(d-o)*x,a+(f-a)*x,6,0,6.3),n.fill(),n.fillStyle="#151b27",n.strokeStyle=h.color,n.lineWidth=3,Pn(n,d-92,f-26,184,52,12),n.fill(),n.stroke(),n.fillStyle=h.busy?h.color:"#3a4354",n.beginPath(),n.arc(d-72,f,6,0,6.3),n.fill(),n.fillStyle="#e8edf5",n.font=`700 19px ${li}`,n.textAlign="left",n.textBaseline="middle",n.fillText(h.label,d-58,f-8),n.fillStyle="#8b96a8",n.font=`600 13px ${li}`,n.fillText((h.status||"").slice(0,24),d-58,f+12)}),n.fillStyle="#151b27",n.strokeStyle="#ed3237",n.lineWidth=4,n.beginPath(),n.arc(o,a,46+Math.sin(t*2)*2,0,6.3),n.fill(),n.stroke(),n.fillStyle="#fff",n.font=`800 20px ${li}`,n.textAlign="center",n.fillText("HERMES",o,a)}var Da={};mf(Da,{M:()=>Kt,MAT:()=>G,allMaterials:()=>xh,armchair:()=>Ws,bench:()=>Ia,bin:()=>Ys,blinds:()=>Eh,bookshelf:()=>Xs,bottle:()=>Ma,box:()=>Q,brandMug:()=>Br,clock:()=>Ph,coffeeMachine:()=>Dh,coffeeTable:()=>ya,credenza:()=>Ea,cyl:()=>Lt,desk:()=>Ur,deskLamp:()=>bh,execDesk:()=>_h,fileCabinet:()=>Ta,floorLamp:()=>Ch,framed:()=>Gr,fridge:()=>Uh,guestChair:()=>va,headphones:()=>Sa,highTable:()=>Ra,keyboardMouse:()=>Fr,kitchenCounter:()=>Ih,laptop:()=>Or,linearLight:()=>Hr,meetingTable:()=>yh,microwave:()=>Lh,monitor:()=>Mh,mug:()=>Ri,nameplate:()=>Th,notepad:()=>ba,officeChair:()=>Nr,papers:()=>zr,pcParts:()=>wh,pcTower:()=>Pa,pedestal:()=>Oh,pendant:()=>Vn,phoneDesk:()=>kr,plane:()=>sn,plant:()=>xe,printer:()=>wa,receptionDesk:()=>Nh,ringLight:()=>Sh,roundTable:()=>vh,rug:()=>qs,safe:()=>Rh,serverRack:()=>Ah,sofa:()=>Gs,softbox:()=>Ca,stool:()=>Vs,texMat:()=>Ai,tripodCamera:()=>Fh,tv:()=>$i,waterCooler:()=>Aa,whiteboard:()=>Vr});var Lr=new I;function Sn(i,t,e,n,s,r){let o=2*Math.PI*s/4,a=Math.max(r-2*s,0),c=Math.PI/4;Lr.copy(t),Lr[n]=0,Lr.normalize();let h=.5*o/(o+a),l=1-Lr.angleTo(i)/c;return Math.sign(Lr[e])===1?l*h:a/(o+a)+h+h*(1-l)}var xa=class extends en{constructor(t=1,e=1,n=1,s=2,r=.1){if(s=s*2+1,r=Math.min(t/2,e/2,n/2,r),super(1,1,1,s,s,s),s===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let a=new I,c=new I,h=new I(t,e,n).divideScalar(2).subScalar(r),l=this.attributes.position.array,u=this.attributes.normal.array,d=this.attributes.uv.array,f=l.length/6,p=new I,x=.5/s;for(let g=0,m=0;g<l.length;g+=3,m+=2)switch(a.fromArray(l,g),c.copy(a),c.x-=Math.sign(c.x)*x,c.y-=Math.sign(c.y)*x,c.z-=Math.sign(c.z)*x,c.normalize(),l[g+0]=h.x*Math.sign(a.x)+c.x*r,l[g+1]=h.y*Math.sign(a.y)+c.y*r,l[g+2]=h.z*Math.sign(a.z)+c.z*r,u[g+0]=c.x,u[g+1]=c.y,u[g+2]=c.z,Math.floor(g/f)){case 0:p.set(1,0,0),d[m+0]=Sn(p,c,"z","y",r,n),d[m+1]=1-Sn(p,c,"y","z",r,e);break;case 1:p.set(-1,0,0),d[m+0]=1-Sn(p,c,"z","y",r,n),d[m+1]=1-Sn(p,c,"y","z",r,e);break;case 2:p.set(0,1,0),d[m+0]=1-Sn(p,c,"x","z",r,t),d[m+1]=Sn(p,c,"z","x",r,n);break;case 3:p.set(0,-1,0),d[m+0]=1-Sn(p,c,"x","z",r,t),d[m+1]=1-Sn(p,c,"z","x",r,n);break;case 4:p.set(0,0,1),d[m+0]=1-Sn(p,c,"x","y",r,t),d[m+1]=1-Sn(p,c,"y","x",r,e);break;case 5:p.set(0,0,-1),d[m+0]=Sn(p,c,"x","y",r,t),d[m+1]=1-Sn(p,c,"y","x",r,e);break}}};var _a=new Map;function Kt(i,t){if(!_a.has(i)){let e=t();e.name=i,_a.set(i,e)}return _a.get(i)}var xh=()=>[..._a.values()],ge=(i,t=.7,e=0,n={})=>new le({color:i,roughness:t,metalness:e,...n}),G={white:()=>Kt("white",()=>ge(16053490,.55)),black:()=>Kt("black",()=>ge(1776929,.55,.1)),blackMetal:()=>Kt("blackMetal",()=>ge(2105895,.38,.75)),steel:()=>Kt("steel",()=>ge(12172998,.32,.9)),chrome:()=>Kt("chrome",()=>ge(14672872,.15,1)),wood:()=>Kt("wood",()=>ge(13215098,.6)),oak:()=>Kt("oak",()=>ge(14269843,.62)),walnut:()=>Kt("walnut",()=>ge(5979434,.5)),darkWood:()=>Kt("darkWood",()=>ge(3351579,.45)),leather:()=>Kt("leather",()=>ge(2760988,.42)),leatherTan:()=>Kt("leatherTan",()=>ge(9067066,.5)),fabricGray:()=>Kt("fabricGray",()=>ge(7304573,.95)),fabricDark:()=>Kt("fabricDark",()=>ge(3159099,.95)),fabricRed:()=>Kt("fabricRed",()=>ge(13183022,.9)),fabricBeige:()=>Kt("fabricBeige",()=>ge(14275269,.95)),fabricBlue:()=>Kt("fabricBlue",()=>ge(3362926,.95)),plastic:()=>Kt("plastic",()=>ge(15132906,.5)),rubber:()=>Kt("rubber",()=>ge(1118740,.9)),screenOff:()=>Kt("screenOff",()=>ge(526603,.2,.2)),leaf:()=>Kt("leaf",()=>ge(4160844,.8,0,{side:Oe})),leafDark:()=>Kt("leafDark",()=>ge(2908480,.8,0,{side:Oe})),pot:()=>Kt("pot",()=>ge(15328992,.7)),potDark:()=>Kt("potDark",()=>ge(3816770,.7)),soil:()=>Kt("soil",()=>ge(3878178,1)),paper:()=>Kt("paper",()=>ge(16448250,.9)),brass:()=>Kt("brass",()=>ge(13083226,.3,.9)),red:()=>Kt("red",()=>ge(15544887,.5)),glassDark:()=>Kt("glassDark",()=>ge(1448221,.08,.3)),color:(i,t=.7,e=0)=>Kt("c"+i+"_"+t+"_"+e,()=>ge(i,t,e)),emissive:(i,t=1)=>Kt("e"+i+"_"+t,()=>{let e=new le({color:0,emissive:i,emissiveIntensity:t,roughness:.4});return e.userData.bloom=!0,e}),basic:i=>Kt("b"+i,()=>new Ee({color:i}))};function Ai(i,t,{emissive:e=!1,rough:n=.6,intensity:s=1,transparent:r=!1}={}){return Kt("t:"+i,()=>{let o=t.isTexture?t:un(t);if(e){let a=Math.round(225*Math.min(1,s)),c=new Ee({map:o,toneMapped:!1,color:new Wt(`rgb(${a},${a},${a})`)});return c.userData.bloom=!0,c}return new le({map:o,roughness:n,metalness:0,transparent:r})})}var gh=new Map,In=(i,t)=>(gh.has(i)||gh.set(i,t()),gh.get(i));function Q(i,t,e,n,s=0,r=0,o=0,a={}){let c=a.r?In(`rb${i}_${t}_${e}_${a.r}`,()=>new xa(i,t,e,3,Math.min(a.r,i/2-.001,t/2-.001,e/2-.001))):In(`b${i}_${t}_${e}`,()=>new en(i,t,e)),h=new qt(c,n);return h.position.set(s,r,o),h.castShadow=a.cast!==!1,h.receiveShadow=a.receive!==!1,h}function Lt(i,t,e,n,s=0,r=0,o=0,a=20,c={}){let h=new qt(In(`c${i}_${t}_${e}_${a}`,()=>new Ls(i,t,e,a)),n);return h.position.set(s,r,o),h.castShadow=c.cast!==!1,h.receiveShadow=!0,h}function sn(i,t,e,n=0,s=0,r=0){let o=new qt(In(`p${i}_${t}`,()=>new vn(i,t)),e);return o.position.set(n,s,r),o.receiveShadow=!0,o}var Ht=(...i)=>{let t=new ie;return i.forEach(e=>e&&t.add(e)),t};function Ur({w:i=1.6,d:t=.75,h:e=.74,top:n=G.white(),frame:s=G.blackMetal(),modesty:r=!0,drawers:o=!1}={}){let a=Ht();a.add(Q(i,.03,t,n,0,e-.015,0,{r:.008}));for(let c of[-1,1])a.add(Q(.05,e-.03,.05,s,c*(i/2-.07),(e-.03)/2,t/2-.08)),a.add(Q(.05,e-.03,.05,s,c*(i/2-.07),(e-.03)/2,-t/2+.08)),a.add(Q(.05,.03,t-.12,s,c*(i/2-.07),.015,0)),a.add(Q(.05,.04,t-.2,s,c*(i/2-.07),e-.05,0));if(r&&a.add(Q(i-.2,.34,.018,s,0,e-.24,t/2-.1)),r&&(a.add(Q(i*.55,.05,.11,G.color(2764083,.6,.3),0,e-.1,t/2-.2,{cast:!1})),a.add(Q(.014,e-.14,.014,G.rubber(),i/2-.1,(e-.14)/2,t/2-.1,{cast:!1})),a.add(Q(.26,.035,.06,G.white(),i/2-.3,.02,t/2-.12,{cast:!1}))),o){let c=i/2-.3;a.add(Q(.4,.56,t-.2,G.white(),c,.31,0,{r:.01}));for(let h=0;h<3;h++)a.add(Q(.14,.012,.012,s,c,.14+h*.18,-(t-.2)/2-.008))}return a.userData.size=[i,t],a}function _h(){let i=Ht(),t=2.3,e=1,n=.75;i.add(Q(t+.06,.05,e+.04,G.walnut(),0,n-.025,0,{r:.012})),i.add(Q(t-.5,.012,e-.35,G.leather(),0,n+.004,-.05,{r:.004})),i.add(Q(t-.1,n-.07,.04,G.darkWood(),0,(n-.05)/2,e/2-.06)),i.add(Q(t-.3,.02,.012,G.brass(),0,.42,e/2-.035));for(let s of[-1,1]){i.add(Q(.5,n-.07,e-.14,G.darkWood(),s*(t/2-.29),(n-.05)/2,-.02,{r:.01}));for(let r=0;r<3;r++)i.add(Q(.44,.19,.015,G.walnut(),s*(t/2-.29),.13+r*.21,-e/2+.045)),i.add(Q(.12,.012,.014,G.brass(),s*(t/2-.29),.13+r*.21,-e/2+.034))}return i.userData.size=[t,e],i}function Nr({fabric:i=G.fabricDark(),exec:t=!1}={}){let e=Ht(),n=.49,s=G.blackMetal();for(let c=0;c<5;c++){let h=c*Math.PI*2/5,l=Q(.045,.03,.3,s,Math.sin(h)*.15,.075,Math.cos(h)*.15);l.rotation.y=h,e.add(l),e.add(Lt(.028,.028,.045,G.rubber(),Math.sin(h)*.29,.028,Math.cos(h)*.29,10))}e.add(Lt(.028,.035,n-.14,G.chrome(),0,(n-.14)/2+.07,0,12)),e.add(Q(.3,.035,.3,s,0,n-.085,0)),e.add(Q(t?.54:.48,.085,t?.52:.47,i,0,n-.042,0,{r:.035}));let r=t?.78:.52,o=Q(t?.52:.45,r,.075,i,0,n+.09+r/2,t?-.27:-.245,{r:.035});o.rotation.x=-.1,e.add(o);let a=Q(.06,.34,.03,s,0,n+.08,-.25);if(a.rotation.x=-.12,e.add(a),t){let c=Q(.34,.16,.08,i,0,n+.09+r+.06,-.345,{r:.035});c.rotation.x=-.1,e.add(c)}for(let c of[-1,1])e.add(Q(.035,.2,.035,s,c*(t?.29:.26),n+.08,-.05)),e.add(Q(.06,.03,.26,t?i:G.rubber(),c*(t?.29:.26),n+.19,0,{r:.012}));return e}function va(i=G.fabricGray()){let t=Ht(),e=.49,n=G.blackMetal();for(let r of[-1,1])for(let o of[-1,1])t.add(Lt(.014,.014,e-.04,n,r*.21,(e-.04)/2,o*.2,8));t.add(Q(.48,.08,.46,i,0,e-.04,0,{r:.03}));let s=Q(.46,.4,.06,i,0,e+.26,-.22,{r:.03});s.rotation.x=-.12,t.add(s);for(let r of[-1,1])t.add(Q(.02,.26,.02,n,r*.19,e+.08,-.2));return t}function Vs(i=G.oak()){let t=Ht();t.add(Lt(.17,.17,.04,i,0,.74,0,20)),t.add(Lt(.02,.02,.7,G.blackMetal(),0,.37,0,10)),t.add(Lt(.2,.22,.02,G.blackMetal(),0,.01,0,20));let e=new qt(In("stoolring",()=>new si(.14,.01,6,20)),G.blackMetal());return e.rotation.x=Math.PI/2,e.position.y=.28,t.add(e),t}function Gs({w:i=1.9,fabric:t=G.fabricGray(),legs:e=G.oak()}={}){let n=Ht(),s=.86;n.add(Q(i,.14,s,t,0,.22,0,{r:.04}));let r=i>1.5?i>2.4?3:2:1,o=(i-.36)/r;for(let a=0;a<r;a++){n.add(Q(o-.02,.16,s-.26,t,-i/2+.18+o*(a+.5),.36,.08,{r:.05}));let c=Q(o-.02,.4,.17,t,-i/2+.18+o*(a+.5),.6,-s/2+.2,{r:.06});c.rotation.x=-.14,n.add(c)}n.add(Q(i,.5,.16,t,0,.5,-s/2+.08,{r:.05}));for(let a of[-1,1]){n.add(Q(.17,.42,s,t,a*(i/2-.085),.4,0,{r:.05}));for(let c of[-1,1])n.add(Lt(.022,.016,.15,e,a*(i/2-.12),.075,c*(s/2-.1),8))}return n}function Ws(i=G.leatherTan()){return Gs({w:.92,fabric:i})}function ya({w:i=1.1,d:t=.6,top:e=G.walnut()}={}){let n=Ht();n.add(Q(i,.035,t,e,0,.4,0,{r:.012}));for(let s of[-1,1])for(let r of[-1,1])n.add(Lt(.016,.012,.38,G.blackMetal(),s*(i/2-.08),.19,r*(t/2-.07),8));return n.add(Q(.26,.02,.19,G.color(2051705),-.2,.43,.02)),n.add(Q(.24,.02,.17,G.color(15921126),-.19,.45,.03)),n}function vh({r:i=.45,h:t=.74,top:e=G.white()}={}){let n=Ht();return n.add(Lt(i,i,.03,e,0,t-.015,0,36)),n.add(Lt(.035,.035,t-.05,G.blackMetal(),0,(t-.05)/2+.02,0,12)),n.add(Lt(i*.6,i*.62,.02,G.blackMetal(),0,.01,0,28)),n}function yh({w:i=3.6,d:t=1.3}={}){let e=Ht();e.add(Q(i,.045,t,G.oak(),0,.735,0,{r:.02})),e.add(Q(i*.5,.012,.16,G.blackMetal(),0,.762,0));for(let n of[-1,1])e.add(Q(.08,.7,t*.62,G.blackMetal(),n*(i/2-.5),.36,0)),e.add(Q(.1,.02,t*.8,G.blackMetal(),n*(i/2-.5),.01,0));return e.add(Q(i-1,.06,.06,G.blackMetal(),0,.66,0)),e}function Mh({w:i=.62,h:t=.36,tex:e=null,key:n="mon"}={}){let s=Ht(),r=.24+t/2;s.add(Q(i+.02,t+.02,.022,G.black(),0,r,0,{r:.006}));let o=sn(i-.012,t-.012,e?Ai(n,e,{emissive:!0,intensity:.92}):G.screenOff(),0,r,.0125);return o.castShadow=!1,s.add(o),e&&e.getContext&&(o.userData.screen={canvas:e,w:i-.012,h:t-.012}),s.userData.screenMesh=o,s.add(Q(.05,.24,.03,G.blackMetal(),0,.13,-.03)),s.add(Q(.24,.012,.17,G.blackMetal(),0,.006,-.02,{r:.004})),s}function Fr(i=!0){let t=Ht();return t.add(Q(.42,.016,.13,i?G.black():G.plastic(),0,.008,0,{r:.005,cast:!1})),t.add(Q(.38,.004,.1,i?G.color(2895669):G.color(13620184),0,.018,0,{cast:!1})),t.add(Q(.06,.028,.1,i?G.black():G.plastic(),.32,.014,0,{r:.012,cast:!1})),t}function Or(i,t="lap"){let e=Ht();e.add(Q(.34,.016,.24,G.steel(),0,.008,0,{r:.004})),e.add(Q(.3,.002,.11,G.color(3158842),0,.017,-.035,{cast:!1}));let n=Ht();n.add(Q(.34,.225,.008,G.steel(),0,.1125,0));let s=sn(.32,.2,i?Ai(t,i,{emissive:!0,intensity:.9}):G.screenOff(),0,.115,.0045);return n.add(s),n.position.set(0,.014,-.118),n.rotation.x=-.28,e.add(n),e}function kr(){let i=Ht();i.add(Q(.17,.05,.2,G.black(),0,.03,0,{r:.01}));let t=Q(.05,.035,.2,G.black(),-.05,.07,0,{r:.012});return i.add(t),i.add(Q(.07,.003,.09,G.color(3883600),.035,.057,.02,{cast:!1})),i}function bh(i=G.brass()){let t=Ht();t.add(Lt(.08,.09,.02,i,0,.01,0,20));let e=Lt(.008,.008,.36,i,0,.19,0,8);t.add(e);let n=Lt(.008,.008,.26,i,0,.4,.1,8);n.rotation.x=1.1,t.add(n);let s=Lt(.03,.08,.1,i,0,.42,.22,16);s.rotation.x=.5,t.add(s);let r=Lt(.06,.06,.01,G.emissive(16773328,1.6),0,.378,.243,16);return r.rotation.x=.5,r.castShadow=!1,t.add(r),t}function zr(i=3){let t=Ht();for(let e=0;e<i;e++){let n=Q(.21,.004,.297,G.paper(),e%2*.012,.004+e*.004,e%3*.008,{cast:!1});n.rotation.y=(e-1)*.09,t.add(n)}return t}function Ri(i=16777215){let t=Ht();t.add(Lt(.04,.035,.09,G.color(i,.4),0,.045,0,14)),t.add(Lt(.034,.034,.004,G.color(3810068,.3),0,.086,0,14,{cast:!1}));let e=new qt(In("mugh",()=>new si(.026,.007,6,12,Math.PI)),G.color(i,.4));return e.rotation.z=-Math.PI/2,e.position.set(.04,.045,0),t.add(e),t}function Br(i){let t=Ri(16777215),e=sn(.062,.062*154/500,i,0,.047,.0412);return e.castShadow=!1,t.add(e),t}function Ma(i=4891615){let t=Ht();return t.add(Lt(.032,.032,.17,Kt("bottle"+i,()=>new le({color:i,transparent:!0,opacity:.55,roughness:.15})),0,.085,0,12,{cast:!1})),t.add(Lt(.018,.03,.035,Kt("bottle"+i),0,.187,0,12,{cast:!1})),t.add(Lt(.02,.02,.022,G.color(16777215,.5),0,.214,0,10,{cast:!1})),t}function ba(i=15911244){let t=Ht();t.add(Q(.13,.012,.19,G.color(i,.8),0,.006,0,{cast:!1})),t.add(Q(.12,.004,.18,G.paper(),.002,.014,0,{cast:!1}));let e=Lt(.005,.005,.14,G.color(2051705,.4),.1,.006,.01,6,{cast:!1});return e.rotation.x=Math.PI/2,e.rotation.z=.3,t.add(e),t}function Sa(){let i=Ht(),t=new qt(In("hpband",()=>new si(.085,.008,6,18,Math.PI)),G.black());t.rotation.set(Math.PI/2-.25,0,0),t.position.set(0,.045,0),t.castShadow=!0,i.add(t);for(let e of[-1,1]){let n=Lt(.04,.04,.03,G.black(),e*.085,.03,.01,14);n.rotation.z=Math.PI/2,i.add(n);let s=Lt(.036,.036,.012,G.fabricDark(),e*.066,.03,.01,14);s.rotation.z=Math.PI/2,i.add(s)}return i}function Vn({color:i=G.black(),r:t=.2,drop:e=.75,warm:n=16770754}={}){let s=Ht();s.add(Lt(.004,.004,e,G.rubber(),0,-e/2,0,5,{cast:!1})),s.add(Lt(.045,.045,.02,i,0,-.01,0,12,{cast:!1})),s.add(Lt(.06,t,.2,i,0,-e-.1,0,22));let r=Lt(t-.012,t-.012,.006,G.emissive(n,2.2),0,-e-.199,0,22,{cast:!1});return s.add(r),s}function Hr(i=2.6,t=.6){let e=Ht();e.add(Q(i,.045,.07,G.black(),0,-t,0)),e.add(Q(i-.04,.008,.055,G.emissive(16774888,2),0,-t-.026,0,{cast:!1}));for(let n of[-1,1])e.add(Lt(.003,.003,t,G.rubber(),n*(i/2-.25),-t/2,0,5,{cast:!1}));return e}function Sh(){let i=Ht();for(let n=0;n<3;n++){let s=Lt(.009,.009,.9,G.blackMetal(),.14,.4,0,6);s.rotation.z=.32;let r=new ie;r.rotation.y=n*2.094,r.add(s),i.add(r)}i.add(Lt(.012,.012,.95,G.blackMetal(),0,1.25,0,8));let t=new qt(In("ringlight",()=>new si(.2,.022,10,36)),G.emissive(16774112,2.4));t.position.set(0,1.78,0),t.castShadow=!1,i.add(t);let e=new qt(In("ringback",()=>new si(.2,.03,8,30)),G.black());return e.position.set(0,1.78,-.012),i.add(e),i}function wh(){let i=Ht(),t=G.color(2059077,.5);i.add(Q(.3,.008,.24,t,0,.004,0,{cast:!1})),i.add(Q(.045,.03,.045,G.steel(),-.04,.02,-.03)),i.add(Lt(.045,.045,.04,G.color(2764083,.4,.5),-.04,.055,-.03,16));for(let o=0;o<4;o++)i.add(Q(.006,.03,.13,G.color(o%2?1382170:13183022,.4),.04+o*.012,.02,-.03,{cast:!1}));i.add(Q(.2,.012,.012,G.color(1382170),-.02,.012,.07,{cast:!1}));for(let o=0;o<6;o++)i.add(Lt(.008,.008,.02,G.color(2830134),-.13+o*.016,.016,-.1,8,{cast:!1}));let e=Ht();e.add(Q(.27,.04,.115,G.color(1776929,.35,.4),0,.02,0,{r:.006}));for(let o of[-.07,.07]){let a=Lt(.042,.042,.004,G.color(3356478,.4),o,.042,0,16,{cast:!1});e.add(a)}e.add(Q(.27,.004,.012,G.emissive(3718648,1.6),0,.03,.058,{cast:!1})),e.position.set(.36,0,.02),e.rotation.y=.25,i.add(e);let n=Ht(),s=Lt(.014,.014,.09,G.red(),0,0,0,10);s.rotation.z=Math.PI/2,n.add(s);let r=Lt(.004,.004,.11,G.steel(),.1,0,0,6);return r.rotation.z=Math.PI/2,n.add(r),n.position.set(.1,.014,.19),n.rotation.y=-.4,i.add(n),i.add(Q(.1,.02,.1,G.color(1382170,.3,.6),-.26,.01,.1,{cast:!1})),i}function Eh(i,t,{tilt:e=.6,step:n=.085}={}){let s=Ht(),r=G.color(15855593,.6),o=Math.floor(t/n);for(let a=0;a<=o;a++){let c=Q(i-.04,.004,.05,r,0,-t/2+a*n,.05);c.rotation.x=e,s.add(c)}s.add(Q(i,.05,.06,r,0,t/2+.02,.05));for(let a of[-1,1])s.add(Lt(.0025,.0025,t,G.color(14540253),a*(i/2-.25),0,.05,4,{cast:!1}));return s}function Th(i,t){let e=Ht(),n=Q(.46,.085,.05,G.darkWood(),0,.0425,0,{r:.006});n.rotation.x=-.25,e.add(n);let s=sn(.43,.068,Ai("np:"+i,Dr(i,{w:860,h:136,bg:"#c7a25a",color:"#241a10",size:62,weight:800,sub:t,letter:2}),{rough:.35}),0,.047,.0265);return s.rotation.x=-.25,s.castShadow=!1,e.add(s),e}function $i({w:i=1.6,h:t=.9,tex:e,key:n,intensity:s=1}={}){let r=Ht();r.add(Q(i+.04,t+.04,.045,G.black(),0,0,.0225,{r:.008}));let o=sn(i,t,e?e.isMaterial?e:Ai(n,e,{emissive:!0,intensity:s}):G.screenOff(),0,0,.047);return o.castShadow=!1,r.add(o),r.userData.screenMesh=o,e&&e.getContext&&(o.userData.screen={canvas:e,w:i,h:t}),r}function Vr({w:i=2,h:t=1.1,seed:e=1,accent:n}={}){let s=Ht();s.add(Q(i+.05,t+.05,.025,G.steel(),0,0,.0125));let r=sn(i,t,Ai("wb"+e,$d(e,n),{rough:.25}),0,0,.027);return s.add(r),s.add(Q(i*.5,.02,.07,G.steel(),0,-t/2-.03,.05)),s.add(Q(.1,.03,.03,G.red(),-.2,-t/2-.008,.06)),s.add(Q(.1,.03,.03,G.color(2450411),0,-t/2-.008,.06)),s}function Gr({w:i,h:t,tex:e,key:n,frame:s=G.black(),mat:r=0,fw:o=.035,depth:a=.035,glass:c=!1,emissive:h=!1}={}){let l=Ht(),u=i+r*2,d=t+r*2;if(l.add(Q(u+o*2,d+o*2,a,s,0,0,a/2,{r:.006})),r){let p=sn(u,d,G.color(16184298,.9),0,0,a+.001);l.add(p)}let f=sn(i,t,Ai(n,e,{rough:.55,emissive:h,intensity:.5}),0,0,a+.002);if(l.add(f),c){let p=sn(u,d,Kt("pictureGlass",()=>new le({color:16777215,transparent:!0,opacity:.08,roughness:.02,metalness:0,depthWrite:!1})),0,0,a+.006);p.castShadow=!1,l.add(p)}return l}function wa(){let i=Ht();i.add(Q(.5,.86,.52,G.plastic(),0,.43,0,{r:.02})),i.add(Q(.46,.06,.4,G.color(3817287),0,.89,.02,{r:.01})),i.add(Q(.2,.012,.12,G.screenOff(),.1,.925,.16)),i.add(Q(.36,.012,.26,G.color(10133672,.6),0,.716,.33,{r:.004}));for(let t=0;t<3;t++)i.add(Q(.42,.008,.01,G.color(13225169),0,.14+t*.18,.262));return i}function Ah(i=1){let t=Ht(),e=bn(i*31),n=.7,s=2.05,r=1;t.add(Q(n,s,r,G.color(1447964,.4,.5),0,s/2,0,{r:.012})),t.add(Q(n-.08,s-.14,.01,G.color(723982,.3,.3),0,s/2,r/2+.002));let o=[];for(let c=0;c<15;c++){let h=.16+c*.122;t.add(Q(n-.12,.1,.012,G.color(c%4===3?2764341:1974566,.5,.6),0,h,r/2+.008));for(let l=0;l<4;l++){let u=e()>.75?16096779:e()>.5?3718648:2278750;o.push({pos:[-n/2+.1+l*.035,h+.02,r/2+.016],color:u,phase:e()*10,rate:1.5+e()*9})}}let a=sn(n-.1,s-.16,Kt("rackGlass",()=>new le({color:10466504,transparent:!0,opacity:.12,roughness:.05,depthWrite:!1})),0,s/2,r/2+.03);return a.castShadow=!1,t.add(a),t.userData.leds=o,t}function Xs({w:i=1.8,h:t=2.1,d:e=.34,wood:n=G.walnut(),seed:s=1,decor:r=!0}={}){let o=Ht(),a=bn(s*101);o.add(Q(i,t,.02,n,0,t/2,-e/2+.01));for(let u of[-1,1])o.add(Q(.03,t,e,n,u*(i/2-.015),t/2,0));let c=Math.round(t/.4),h=Math.max(1,Math.round(i/.9));for(let u=0;u<=c;u++)o.add(Q(i-.06,.028,e,n,0,.014+u*(t-.028)/c,0));for(let u=1;u<h;u++)o.add(Q(.025,t,e-.02,n,-i/2+u*i/h,t/2,0));let l=[9251627,2046807,3104080,14272419,3815994,11032106,15262938,7023951,2378362,13148746];for(let u=0;u<c;u++)for(let d=0;d<h;d++){let f=.028+u*(t-.028)/c,p=-i/2+d*i/h+.04,x=i/h-.08,g=a();if(r&&g>.78){if(a()>.5){let E=xe({h:.3,small:!0});E.position.set(p+x/2,f,0),o.add(E)}else o.add(Q(.16,.2,.03,G.brass(),p+x*.4,f+.1,0)),o.add(Lt(.07,.05,.16,G.pot(),p+x*.75,f+.08,0,14));continue}let m=p,w=p+x*(.55+a()*.45);for(;m<w;){let E=.025+a()*.035,S=.2+a()*.1;o.add(Q(E,S,.2+a()*.04,G.color(l[a()*l.length|0],.75),m+E/2,f+S/2,.02,{cast:!1})),m+=E+.003}}return o}function Ea({w:i=1.8,h:t=.72,d:e=.45,wood:n=G.walnut(),front:s=G.darkWood()}={}){let r=Ht();r.add(Q(i,t-.12,e,n,0,(t-.12)/2+.12,0,{r:.012}));let o=Math.round(i/.6);for(let a=0;a<o;a++)r.add(Q(i/o-.02,t-.18,.015,s,-i/2+(a+.5)*i/o,(t-.12)/2+.12,e/2+.004)),r.add(Q(.012,.14,.014,G.brass(),-i/2+(a+.5)*i/o+(a%2?-1:1)*(i/o/2-.05),t*.58,e/2+.016));for(let a of[-1,1])for(let c of[-1,1])r.add(Lt(.02,.015,.12,G.blackMetal(),a*(i/2-.1),.06,c*(e/2-.07),8));return r}function Ta({w:i=.5,h:t=1.32,d:e=.6,color:n=G.color(14672614,.5,.3)}={}){let s=Ht();s.add(Q(i,t,e,n,0,t/2,0,{r:.008}));let r=Math.round(t/.33);for(let o=0;o<r;o++)s.add(Q(i-.04,t/r-.03,.012,G.color(15659250,.5,.2),0,(o+.5)*t/r,e/2+.004)),s.add(Q(.14,.018,.016,G.steel(),0,(o+.5)*t/r+.06,e/2+.014));return s}function Rh(){let i=Ht();i.add(Q(.62,.86,.6,G.color(2830648,.35,.7),0,.43,0,{r:.02})),i.add(Q(.52,.74,.02,G.color(3488837,.3,.8),0,.43,.305,{r:.01}));let t=Lt(.07,.07,.03,G.chrome(),0,.5,.33,24);t.rotation.x=Math.PI/2,i.add(t);let e=Q(.03,.2,.03,G.chrome(),.17,.43,.33);return i.add(e),i}function xe({h:i=1.5,small:t=!1,pot:e=G.pot(),kind:n=0}={}){let s=Ht(),r=t?.1:.36,o=t?.06:.19;s.add(Lt(o,o*.78,r,e,0,r/2,0,20)),s.add(Lt(o*.92,o*.92,.01,G.soil(),0,r-.004,0,16,{cast:!1}));let a=bn(Math.round(i*1e3)+n*7+(t?3:0)),c=t?7:16,h=In("leaf",()=>{let l=new br;l.moveTo(0,0),l.bezierCurveTo(.34,.25,.3,.75,0,1),l.bezierCurveTo(-.3,.75,-.34,.25,0,0);let u=new Jo(l,8),d=u.attributes.position;for(let f=0;f<d.count;f++){let p=d.getY(f),x=d.getX(f);d.setZ(f,-p*p*.35+Math.abs(x)*.25)}return u.computeVertexNormals(),u});!t&&n!==1&&s.add(Lt(.016,.022,i*.5,G.color(6047281,.9),0,r+i*.25,0,6));for(let l=0;l<c;l++){let u=new qt(h,l%3?G.leaf():G.leafDark()),d=l*2.399+a()*.4,f=l/c,p=(t?.16:.42+a()*.3)*(n===1?1.5:n===2?.8:1);u.scale.set(p*(n===1?.35:n===2?1.25:.8),p,p);let x=new ie;x.position.set(0,t||n===1?r:r+i*(.25+.3*f),0),x.rotation.y=d,u.rotation.x=n===1?.12+a()*.35:.5+f*.6+a()*.3,x.add(u),u.castShadow=!0,s.add(x)}return s}function qs(i,t,e=3816772,n=null){let s=Ht(),r=Kt("rug"+e,()=>new le({map:un(ma("#"+e.toString(16).padStart(6,"0"),9,!1),{repeat:[i,t]}),roughness:1})),o=Q(i,.012,t,r,0,.006,0,{cast:!1});if(s.add(o),n!==null){let a=G.color(n,.95);s.add(Q(i,.013,.07,a,0,.0065,t/2-.035,{cast:!1})),s.add(Q(i,.013,.07,a,0,.0065,-t/2+.035,{cast:!1})),s.add(Q(.07,.013,t,a,i/2-.035,.0065,0,{cast:!1})),s.add(Q(.07,.013,t,a,-i/2+.035,.0065,0,{cast:!1}))}return s}function Ch(){let i=Ht();i.add(Lt(.15,.16,.02,G.blackMetal(),0,.01,0,20)),i.add(Lt(.012,.012,1.55,G.brass(),0,.78,0,8));let t=Lt(.16,.22,.28,Kt("lampShade",()=>{let e=new le({color:16774108,emissive:16769712,emissiveIntensity:.7,roughness:.9,side:Oe});return e.userData.bloom=!0,e}),0,1.62,0,24);return i.add(t),i}function Ys(){let i=Ht();return i.add(Lt(.13,.1,.3,G.color(3816770,.6,.3),0,.15,0,14)),i}function Ph(){let i=Ht(),t=Lt(.17,.17,.03,G.black(),0,0,.015,28);t.rotation.x=Math.PI/2,i.add(t);let e=Lt(.155,.155,.005,G.white(),0,0,.032,28);e.rotation.x=Math.PI/2,i.add(e);let n=Q(.012,.085,.004,G.black(),0,.04,.037);n.geometry=n.geometry.clone();let s=new ie;s.add(n),s.position.z=0,i.add(s);let r=Q(.008,.125,.004,G.black(),0,.06,.039),o=new ie;return o.add(r),i.add(o),s.userData.dynamic=o.userData.dynamic=!0,n.userData.dynamic=r.userData.dynamic=!0,i.userData.hands=[s,o],i}function Ih({w:i=3.2}={}){let t=Ht(),e=.62;t.add(Q(i,.86,e-.04,G.color(15789801,.6),0,.43,-.02)),t.add(Q(i+.02,.04,e+.02,G.color(3026997,.25,.1),0,.88,0,{r:.006})),t.add(Q(i,.09,e-.1,G.color(2369066),0,.045,-.04));let n=Math.round(i/.6);for(let r=0;r<n;r++)t.add(Q(i/n-.016,.7,.014,G.white(),-i/2+(r+.5)*i/n,.47,e/2-.035)),t.add(Q(.012,.12,.014,G.steel(),-i/2+(r+.5)*i/n+(i/n/2-.05),.72,e/2-.022));t.add(Q(i,.56,.02,Ai("backsplash",ga("#f6f4ef","#d9d4ca"),{rough:.25}),0,1.2,-e/2+.012)),t.add(Q(i,.62,.34,G.white(),0,1.82,-e/2+.17,{r:.006}));for(let r=1;r<n;r++)t.add(Q(.006,.6,.006,G.color(13225169),-i/2+r*i/n,1.82,-e/2+.342));let s=Q(i-.1,.012,.03,G.emissive(16773590,1.4),0,1.5,-e/2+.3,{cast:!1});return t.add(s),t}function Dh(){let i=Ht();i.add(Q(.3,.4,.42,G.color(2303531,.3,.5),0,.2,0,{r:.02})),i.add(Q(.3,.07,.42,G.chrome(),0,.43,0,{r:.015})),i.add(Q(.22,.02,.16,G.steel(),0,.03,.14)),i.add(Lt(.02,.016,.08,G.chrome(),-.04,.27,.17,8)),i.add(Lt(.02,.016,.08,G.chrome(),.04,.27,.17,8)),i.add(Q(.12,.05,.004,G.emissive(3718648,1),0,.36,.212,{cast:!1}));let t=Ri(16777215);return t.position.set(0,.04,.16),t.scale.setScalar(.85),i.add(t),i}function Lh(){let i=Ht();return i.add(Q(.5,.29,.36,G.steel(),0,.145,0,{r:.01})),i.add(Q(.33,.21,.006,G.glassDark(),-.06,.145,.182)),i.add(Q(.09,.21,.006,G.color(2303531),.185,.145,.182)),i}function Uh(){let i=Ht();return i.add(Q(.72,1.86,.68,G.steel(),0,.93,0,{r:.015})),i.add(Q(.7,.012,.01,G.color(7370109),0,1.18,.341)),i.add(Q(.025,.5,.03,G.chrome(),-.28,1.5,.36)),i.add(Q(.025,.7,.03,G.chrome(),-.28,.72,.36)),i}function Aa(){let i=Ht();return i.add(Q(.32,.98,.32,G.white(),0,.49,0,{r:.02})),i.add(Lt(.13,.14,.4,Kt("waterJug",()=>new le({color:9425151,transparent:!0,opacity:.55,roughness:.1})),0,1.19,0,18)),i.add(Q(.2,.12,.02,G.color(14278114),0,.72,.165)),i.add(Q(.03,.03,.03,G.color(2450411),-.05,.75,.185)),i.add(Q(.03,.03,.03,G.red(),.05,.75,.185)),i}function Ra({w:i=1.5,d:t=.6}={}){let e=Ht();e.add(Q(i,.04,t,G.oak(),0,1.06,0,{r:.012}));for(let n of[-1,1])e.add(Q(.04,1.02,.04,G.blackMetal(),n*(i/2-.1),.52,0)),e.add(Q(.05,.02,t-.08,G.blackMetal(),n*(i/2-.1),.01,0));return e.add(Q(i-.2,.03,.03,G.blackMetal(),0,.3,0)),e}function Nh(i){let t=Ht(),e=2.8;t.add(Q(e,1.08,.12,G.white(),0,.54,.34,{r:.012})),t.add(Q(e+.08,.04,.36,G.walnut(),0,1.1,.24,{r:.012})),t.add(Q(e,.03,.78,G.white(),0,.74,-.08,{r:.008}));for(let s of[-1,1])t.add(Q(.1,1.08,.8,G.white(),s*(e/2-.05),.54,-.02,{r:.012}));t.add(Q(e-.3,.72,.014,G.red(),0,.5,.404));let n=sn(1.85,.57,Kt("logoWhite",()=>new Ee({map:i,transparent:!0,color:16777215})),0,.5,.413);return n.castShadow=!1,t.add(n),t.add(Q(e-.2,.016,.02,G.emissive(16777215,1.2),0,.09,.405,{cast:!1})),t}function Ca(){let i=Ht();for(let n=0;n<3;n++){let s=Lt(.01,.01,1,G.blackMetal(),0,.45,0,6);s.rotation.z=.32;let r=new ie;r.rotation.y=n*2.094,s.position.x=.15,r.add(s),i.add(r)}i.add(Lt(.014,.014,1,G.blackMetal(),0,1.38,0,8));let t=Ht();t.add(Q(.62,.62,.3,G.black(),0,0,-.15));let e=sn(.58,.58,G.emissive(16774886,1.5),0,0,.002);return e.castShadow=!1,t.add(e),t.position.set(0,1.85,0),t.rotation.x=.28,i.add(t),i}function Fh(){let i=Ht();for(let n=0;n<3;n++){let s=Lt(.01,.008,1.35,G.blackMetal(),.2,.62,0,6);s.rotation.z=.3;let r=new ie;r.rotation.y=n*2.094+.5,r.add(s),i.add(r)}i.add(Q(.15,.1,.09,G.black(),0,1.33,0,{r:.012}));let t=Lt(.04,.045,.1,G.black(),0,1.33,.09,16);t.rotation.x=Math.PI/2,i.add(t);let e=Lt(.034,.034,.004,G.color(2307663,.05,.6),0,1.33,.142,16);return e.rotation.x=Math.PI/2,i.add(e),i}function Pa(i=!0){let t=Ht();t.add(Q(.22,.46,.46,G.color(1382170,.35,.4),0,.23,0,{r:.012}));let e=sn(.4,.4,Kt("pcGlass",()=>{let n=new le({color:790034,roughness:.05,metalness:.4,emissive:7020968,emissiveIntensity:.5});return n.userData.bloom=!0,n.userData.rgb=.5,n}),.112,.23,0);if(e.rotation.y=Math.PI/2,t.add(e),i)for(let n=0;n<3;n++){let s=Kt("pcFan"+n,()=>{let o=new le({color:0,emissive:[16727423,3718648,8141549][n],emissiveIntensity:1.8,roughness:.4});return o.userData.bloom=!0,o.userData.rgb=n*.12,o}),r=new qt(In("fanring",()=>new si(.05,.008,6,20)),s);r.position.set(0,.1+n*.13,.232),r.castShadow=!1,t.add(r)}return t}function Oh(i=.9){let t=Ht();return t.add(Q(.5,i,.5,G.white(),0,i/2,0,{r:.01})),t}function Ia(i=1.6){let t=Ht();t.add(Q(i,.07,.42,G.oak(),0,.44,0,{r:.02}));for(let e of[-1,1])t.add(Q(.04,.42,.36,G.blackMetal(),e*(i/2-.16),.21,0));return t}var Zs=1,vv="varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",yv=`
precision highp float;
uniform sampler2D tDepth; uniform mat4 uProjInv; uniform mat4 uProj; uniform vec2 uRes; uniform float uRadius; uniform float uNear; uniform float uFar;
varying vec2 vUv;
vec3 viewPos(vec2 uv){ float d = texture2D(tDepth, uv).x; vec4 c = vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); vec4 v = uProjInv * c; return v.xyz / v.w; }
float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
void main(){
  float d0 = texture2D(tDepth, vUv).x; if (d0 >= 0.99999) { gl_FragColor = vec4(1.0); return; }
  vec2 px = 1.0 / uRes; vec3 P = viewPos(vUv);
  // normal from the closest depth neighbours (avoids halos at edges)
  vec3 l = viewPos(vUv - vec2(px.x, 0.0)), r = viewPos(vUv + vec2(px.x, 0.0)), dn = viewPos(vUv - vec2(0.0, px.y)), up = viewPos(vUv + vec2(0.0, px.y));
  vec3 dx = abs(l.z - P.z) < abs(r.z - P.z) ? P - l : r - P; vec3 dy = abs(dn.z - P.z) < abs(up.z - P.z) ? P - dn : up - P;
  vec3 N = normalize(cross(dx, dy));
  float ang = ign(gl_FragCoord.xy) * 6.2831853; float occ = 0.0; const int NS = 12;
  float rad = uRadius * clamp(-P.z / 12.0, 0.75, 1.5);
  for (int i = 0; i < NS; i++) {
    float fi = float(i); float a = ang + fi * 2.39996323; float rr = sqrt((fi + 0.5) / float(NS));
    vec3 t = normalize(cross(N, abs(N.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0))); vec3 b = cross(N, t);
    float h = 0.25 + 0.75 * fract(fi * 0.618 + ang); vec3 dir = normalize(t * cos(a) * rr + b * sin(a) * rr + N * h);
    vec3 S = P + dir * rad * (0.35 + 0.65 * rr);
    vec4 c = uProj * vec4(S, 1.0); vec2 suv = c.xy / c.w * 0.5 + 0.5; if (suv.x < 0.0 || suv.x > 1.0 || suv.y < 0.0 || suv.y > 1.0) continue;
    float sz = viewPos(suv).z; float range = smoothstep(0.0, 1.0, rad / max(abs(P.z - sz), 1e-4));
    occ += (sz >= S.z + 0.02 ? 1.0 : 0.0) * range;
  }
  float ao = 1.0 - occ / float(NS); ao = pow(clamp(ao, 0.0, 1.0), 2.6);
  gl_FragColor = vec4(vec3(ao), 1.0);
}`,Mv=`
precision highp float; uniform sampler2D tAO; uniform sampler2D tDepth; uniform vec2 uDir; uniform float uNear; uniform float uFar; varying vec2 vUv;
float lin(float d){ float z = d * 2.0 - 1.0; return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }
void main(){ float c = lin(texture2D(tDepth, vUv).x); float sum = 0.0, w = 0.0;
  for (int i = -3; i <= 3; i++) { vec2 uv = vUv + uDir * float(i); float d = lin(texture2D(tDepth, uv).x); float k = exp(-float(i * i) / 6.0) * (abs(d - c) < 0.02 * c + 0.04 ? 1.0 : 0.02); sum += texture2D(tAO, uv).r * k; w += k; }
  gl_FragColor = vec4(vec3(sum / w), 1.0); }`,bv=`
precision highp float; uniform sampler2D tMap; uniform vec2 uDir; varying vec2 vUv;
void main(){ vec3 c = texture2D(tMap, vUv).rgb * 0.227027; c += (texture2D(tMap, vUv + uDir * 1.3846).rgb + texture2D(tMap, vUv - uDir * 1.3846).rgb) * 0.316216; c += (texture2D(tMap, vUv + uDir * 3.2308).rgb + texture2D(tMap, vUv - uDir * 3.2308).rgb) * 0.070270; gl_FragColor = vec4(c, 1.0); }`,Sv=`
precision highp float;
uniform sampler2D tMain, tAO, tB0, tB1, tB2, tB3; uniform vec2 uRes; uniform float uAO, uBloom, uExposure, uTilt, uFocus, uCctv, uTime, uVignette, uSat, uContrast, uGrade, uDebug; uniform vec3 uShadowTint, uHighTint;
varying vec2 vUv;
vec3 rrtFit(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }
vec3 acesMap(vec3 color){ const mat3 I = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777)); const mat3 O = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602)); color *= uExposure / 0.6; color = I * color; color = rrtFit(color); color = O * color; return clamp(color, 0.0, 1.0); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 uv = vUv; vec3 col;
  if (uCctv > 0.5) { vec2 c = uv - 0.5; uv = 0.5 + c * (1.0 + 0.10 * dot(c, c)); }
  if (uTilt > 0.001) { float r = uTilt * smoothstep(0.06, 0.5, abs(uv.y - uFocus)); vec3 acc = vec3(0.0); float a0 = hash(gl_FragCoord.xy) * 6.2831; for (int i = 0; i < 16; i++) { float fi = float(i); float a = a0 + fi * 2.39996; float rr = sqrt((fi + 0.5) / 16.0) * r; acc += texture2D(tMain, uv + vec2(cos(a), sin(a) * uRes.x / uRes.y) * rr).rgb; } col = acc / 16.0; }
  else col = texture2D(tMain, uv).rgb;
  float ao = mix(1.0, texture2D(tAO, uv).r, uAO); col *= ao;
  vec3 bloom = texture2D(tB0, uv).rgb * 0.9 + texture2D(tB1, uv).rgb * 0.8 + texture2D(tB2, uv).rgb * 0.7 + texture2D(tB3, uv).rgb * 0.6; col += bloom * uBloom;
  if (uDebug > 1.5) col = vec3(ao) * 0.6; else if (uDebug > 0.5) col = bloom * uBloom;
  col = acesMap(col);
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col, col * mix(uShadowTint, uHighTint, smoothstep(0.12, 0.85, luma)), uGrade);
  col = mix(vec3(luma), col, uSat); col = (col - 0.5) * uContrast + 0.5;
  vec2 vc = vUv - 0.5; col *= 1.0 - uVignette * smoothstep(0.25, 0.95, dot(vc, vc) * 2.2);
  if (uCctv > 0.5) { float l2 = dot(col, vec3(0.299, 0.587, 0.114)); col = mix(col, vec3(l2) * vec3(0.92, 1.0, 0.95), 0.55); col *= 0.94 + 0.06 * sin(vUv.y * uRes.y * 1.6); col += (hash(vUv * uRes + uTime * 60.0) - 0.5) * 0.045; col *= 1.0 - 0.5 * smoothstep(0.3, 1.0, dot(vc, vc) * 2.6); }
  col = clamp(col, 0.0, 1.0);
  gl_FragColor = vec4(mix(col * 12.92, 1.055 * pow(col, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, col)), 1.0);
}`,La=class{constructor(t,{msaa:e=4,ao:n=!0}={}){this.r=t,this.msaa=e,this.aoOn=n,this.ok=!0,this.cam=new Cs(-1,1,1,-1,0,1),this.quad=new qt(new vn(2,2),null),this.quad.frustumCulled=!1,this.qs=new bi,this.qs.add(this.quad);let s=(r,o)=>new _n({vertexShader:vv,fragmentShader:r,uniforms:o,depthTest:!1,depthWrite:!1});this.mAO=s(yv,{tDepth:{value:null},uProjInv:{value:new Yt},uProj:{value:new Yt},uRes:{value:new yt},uRadius:{value:.32},uNear:{value:.1},uFar:{value:400}}),this.mAOB=s(Mv,{tAO:{value:null},tDepth:{value:null},uDir:{value:new yt},uNear:{value:.1},uFar:{value:400}}),this.mBlur=s(bv,{tMap:{value:null},uDir:{value:new yt}}),this.mFinal=s(Sv,{tMain:{value:null},tAO:{value:null},tB0:{value:null},tB1:{value:null},tB2:{value:null},tB3:{value:null},uRes:{value:new yt},uAO:{value:.85},uBloom:{value:.55},uExposure:{value:1},uTilt:{value:0},uFocus:{value:.5},uCctv:{value:0},uTime:{value:0},uVignette:{value:.22},uSat:{value:1.06},uContrast:{value:1.07},uGrade:{value:1},uDebug:{value:0},uShadowTint:{value:new I(.95,.99,1.07)},uHighTint:{value:new I(1.035,1,.955)}}),this.white=new Ds(new Uint8Array([255,255,255,255]),1,1),this.white.needsUpdate=!0,this.black=new Wt(0),this.tmpC=new Wt}setSize(t,e){if(t=Math.max(2,Math.floor(t)),e=Math.max(2,Math.floor(e)),this.w===t&&this.h===e)return;this.w=t,this.h=e,this.dispose();let n=new Is(t,e);n.type=ni,n.minFilter=n.magFilter=Ke,this.rtMain=new je(t,e,{type:oi,samples:this.msaa,depthBuffer:!0,depthTexture:n}),this.rtEm=new je(t,e,{type:oi,depthBuffer:!0,depthTexture:n});let s=r=>new je(Math.max(2,t>>r),Math.max(2,e>>r),{type:oi,depthBuffer:!1});this.bl=[1,2,3,4].map(r=>[s(r),s(r)]),this.rtAO=[new je(t>>1,e>>1,{depthBuffer:!1}),new je(t>>1,e>>1,{depthBuffer:!1})]}dispose(){for(let t of[this.rtMain,this.rtEm,...(this.bl||[]).flat(),...this.rtAO||[]])t&&t.dispose()}pass(t,e){this.quad.material=t,this.r.setRenderTarget(e),this.r.render(this.qs,this.cam)}render(t,e,n={}){let s=this.r,r=this.mFinal.uniforms;s.setRenderTarget(this.rtMain),s.render(t,e);let o=t.background,a=e.layers.mask,c=s.shadowMap.autoUpdate,h=s.autoClear;s.shadowMap.autoUpdate=!1,t.background=null,s.setRenderTarget(this.rtEm),s.getClearColor(this.tmpC);let l=s.getClearAlpha();s.setClearColor(0,1),s.autoClear=!1,s.clear(!0,!1,!1),e.layers.set(Zs),s.render(t,e),e.layers.mask=a,t.background=o,s.shadowMap.autoUpdate=c,s.autoClear=h,s.setClearColor(this.tmpC,l);let u=this.rtEm.texture;for(let[f,p]of this.bl)this.mBlur.uniforms.tMap.value=u,this.mBlur.uniforms.uDir.value.set(1/f.width,0),this.pass(this.mBlur,f),this.mBlur.uniforms.tMap.value=f.texture,this.mBlur.uniforms.uDir.value.set(0,1/f.height),this.pass(this.mBlur,p),u=p.texture;let d=this.aoOn&&n.ao!==!1;if(d){let f=this.mAO.uniforms;f.tDepth.value=this.rtMain.depthTexture,f.uProj.value.copy(e.projectionMatrix),f.uProjInv.value.copy(e.projectionMatrixInverse),f.uRes.value.set(this.rtAO[0].width,this.rtAO[0].height),f.uNear.value=e.near,f.uFar.value=e.far,this.pass(this.mAO,this.rtAO[0]);let p=this.mAOB.uniforms;p.tDepth.value=this.rtMain.depthTexture,p.uNear.value=e.near,p.uFar.value=e.far,p.tAO.value=this.rtAO[0].texture,p.uDir.value.set(1/this.rtAO[0].width,0),this.pass(this.mAOB,this.rtAO[1]),p.tAO.value=this.rtAO[1].texture,p.uDir.value.set(0,1/this.rtAO[0].height),this.pass(this.mAOB,this.rtAO[0])}r.tMain.value=this.rtMain.texture,r.tAO.value=d?this.rtAO[0].texture:this.white,r.tB0.value=this.bl[0][1].texture,r.tB1.value=this.bl[1][1].texture,r.tB2.value=this.bl[2][1].texture,r.tB3.value=this.bl[3][1].texture,r.uRes.value.set(this.w,this.h),r.uExposure.value=n.exposure??1,r.uTilt.value=n.tilt??0,r.uFocus.value=n.focus??.5,r.uCctv.value=n.cctv?1:0,r.uTime.value=n.time??0,r.uBloom.value=n.bloom??.55,r.uAO.value=n.aoStrength??.85,r.uVignette.value=n.vignette??.22,r.uSat.value=n.sat??1.06,r.uDebug.value=this.debug||0,this.pass(this.mFinal,null)}};var{MAT:Pt,M:Ye,box:jt,cyl:Wr,plane:rn,texMat:wv}=Da,he=2.9,ft={x1:-18,x2:18,z1:-8.5,z2:8.5,c1:-1.5,c2:1.5},Ua={presidencia:{name:"Presid\xEAncia",sub:"Thiago Herrera",x1:-18,x2:-8,z1:-8.5,z2:-1.5,accent:15544887,door:-10.2},vendas:{name:"Vendas & Atendimento",sub:"Bling ERP \xB7 CRM WhatsApp",x1:-8,x2:3,z1:-8.5,z2:-1.5,accent:1096065,door:.8},reuniao:{name:"Sala de Reuni\xE3o",sub:"",x1:3,x2:10,z1:-8.5,z2:-1.5,accent:6583435,door:4},recepcao:{name:"Recep\xE7\xE3o",sub:"Bal\xE3o da Inform\xE1tica",x1:10,x2:18,z1:-8.5,z2:-1.5,accent:15544887,door:null},operacoes:{name:"Opera\xE7\xF5es",sub:"Hermes \xB7 orquestra\xE7\xE3o",x1:-18,x2:-11,z1:1.5,z2:8.5,accent:440020,door:-12.3},mercado:{name:"Intelig\xEAncia de Mercado",sub:"Pre\xE7os e concorr\xEAncia",x1:-11,x2:-5,z1:1.5,z2:8.5,accent:16096779,door:-6.2},criativo:{name:"Est\xFAdio Criativo",sub:"Artes e v\xEDdeos",x1:-5,x2:2,z1:1.5,z2:8.5,accent:14239471,door:-1.2},ti:{name:"TI & Servidores",sub:"VPS \xB7 deploy \xB7 rede",x1:2,x2:9,z1:1.5,z2:8.5,accent:3900150,door:6.3},financeiro:{name:"Financeiro",sub:"PIX \xB7 cobran\xE7as",x1:9,x2:14,z1:1.5,z2:8.5,accent:1357990,door:12.6},copa:{name:"Copa",sub:"Caf\xE9",x1:14,x2:18,z1:1.5,z2:8.5,accent:11817737,door:null}},jd=1.2,Ev=new Wt(658446),Qd=new Wt(16734751),Tv=new Wt(16722474),tf=new Wt,kh=i=>new I(Math.sin(i),0,Math.cos(i)),Gn=i=>"#"+i.toString(16).padStart(6,"0");function ef({scene:i,tex:t,config:e}){let n={rooms:Ua,obstacles:[],seats:new Map,spots:new Map,leds:[],chairs:[],planes:{},caps:{},tick:[],H:he,lamps:[],screens:[],serverAlert:0},s=new ie;s.name="static";let r=new ie;r.name="dynamic",i.add(s,r);for(let C of["N","S","E","W","P","G"])n.planes[C]=new hn(new I(0,-1,0),50),n.caps[C]=[];let o=new Map,a=(C,z)=>{if(!z)return C;let k=C.uuid+z;if(!o.has(k)){let v=C.clone();v.name=(C.name||"m")+"@"+z,v.clippingPlanes=[n.planes[z]],v.clipShadows=!0,o.set(k,v)}return o.get(k)},c=(C,z)=>(C.traverse(k=>{k.isMesh&&(k.material=a(k.material,z))}),C),h=new Ee({color:2830134}),l=(C,z=0,k=0,v=0,{nav:_=!1,y:U=0,dyn:B=!1,pad:H=0}={})=>{if(C.position.set(z,U,k),C.rotation.y=v,(B?r:s).add(C),_){C.updateMatrixWorld(!0);let Y=new xn().setFromObject(C);n.obstacles.push({x1:Y.min.x-H,x2:Y.max.x+H,z1:Y.min.z-H,z2:Y.max.z+H,h:Y.max.y})}return C},u=(C,z,k,v,_=he)=>n.obstacles.push({x1:Math.min(C,k),x2:Math.max(C,k),z1:Math.min(z,v),z2:Math.max(z,v),h:_,wall:!0}),d=Ye("wallWhite",()=>new le({color:16119024,roughness:.92})),f=Ye("wallExt",()=>new le({color:15329250,roughness:.95})),p=Pt.blackMetal(),x=Ye("glass",()=>new Tr({color:12575726,transparent:!0,opacity:.15,roughness:.03,metalness:0,ior:1.5,reflectivity:.6,clearcoat:1,clearcoatRoughness:.04,depthWrite:!1,envMapIntensity:1.7})),g=Ye("frost",()=>new le({color:16777215,transparent:!0,opacity:.42,roughness:.9,depthWrite:!1})),m=[0,1,2].map(C=>un(Zd(C))),w=Ye("sky",()=>{let C=new Ee({map:m[0],toneMapped:!1});return C.userData.bloom=!0,C});n.setSky=C=>{if(w.map!==m[C]){w.map=m[C],w.needsUpdate=!0;for(let z of o.values())z.name.startsWith("sky@")&&(z.map=m[C],z.needsUpdate=!0);n.backdrop&&(n.backdrop.material.map=m[C],n.backdrop.material.needsUpdate=!0)}};let E=(C,z,k,v,_,U=16777215,B=.8)=>Ye("floor:"+C,()=>{let H=z.isTexture?z.clone():un(z);return H.wrapS=H.wrapT=On,H.repeat.set(k/_[0],v/_[1]),H.colorSpace=Pe,H.anisotropy=8,H.needsUpdate=!0,B>=.9?new le({map:H,color:U,roughness:B,metalness:0}):new Tr({map:H,color:U,roughness:B,metalness:0,clearcoat:.35,clearcoatRoughness:.28,envMapIntensity:1.25})});function S(C,z,k,v,_,U=d,{t:B=.12,y0:H=0,y1:Y=he,nav:pt=!0,cap:ot=!0,cast:at=!0}={}){let Mt=Math.abs(z-v)<1e-6,lt=Math.abs(Mt?k-C:v-z);if(lt<.01)return;let gt=jt(Mt?lt:B,Y-H,Mt?B:lt,a(U,_),(C+k)/2,(H+Y)/2,(z+v)/2,{cast:at});if(s.add(gt),pt&&H<1&&u(Mt?C:C-B/2,Mt?z-B/2:z,Mt?k:k+B/2,Mt?v+B/2:v),ot&&_&&H<.5){let ut=new qt(new vn(Mt?lt:B,Mt?B:lt),h);ut.rotation.x=-Math.PI/2,ut.position.set((C+k)/2,0,(z+v)/2),ut.visible=!1,ut.userData.dynamic=!0,r.add(ut),n.caps[_].push(ut)}}function V(C,z,k,v,_,U,B,H={}){let Y=k,pt=[..._].sort((at,Mt)=>at[0]-Mt[0]),ot=(at,Mt,lt)=>C==="x"?S(at,z,Mt,z,U,B,{...H,...lt}):S(z,at,z,Mt,U,B,{...H,...lt});for(let[at,Mt]of pt)ot(Y,at),ot(at,Mt,{y0:2.15,nav:!1,cap:!1}),Y=Mt;ot(Y,v)}function O(C,z,k,v,_,U){let H=(ot,at,Mt,lt=.06)=>s.add(jt(Math.abs(at-ot),lt,.07,a(p,"G"),(ot+at)/2,Mt,C)),Y=(ot,at=0,Mt=he)=>s.add(jt(.05,Mt-at,.07,a(p,"G"),ot,(at+Mt)/2,C));H(z,k,he-.03),Y(z+.025),Y(k-.025);let pt=[z];for(let ot of v)pt.push(ot-jd/2,ot+jd/2);pt.push(k);for(let ot=0;ot<pt.length-1;ot++){let at=pt[ot],Mt=pt[ot+1];if(ot%2===1){Y(at),Y(Mt),H(at,Mt,2.15,.05);let Tt=jt(Mt-at-.05,he-2.15-.09,.012,a(x,"G"),(at+Mt)/2,(2.15+he)/2-.02,C,{cast:!1});s.add(Tt);let dt=new ie,zt=Mt-at-.06;dt.add(jt(zt,2.08,.012,x,zt/2,1.06,0,{cast:!1})),dt.add(jt(zt,.05,.03,p,zt/2,2.1,0)),dt.add(jt(zt,.05,.03,p,zt/2,.03,0)),dt.add(jt(.04,2.1,.03,p,.02,1.06,0)),dt.add(jt(.04,2.1,.03,p,zt-.02,1.06,0)),dt.add(jt(.025,.3,.07,Pt.chrome(),zt-.09,1.05,0)),dt.position.set(at+.03,0,C),dt.rotation.y=_>0?-1.42:1.42,c(dt,"G"),s.add(dt);let Bt=at+.03+Math.cos(1.42)*zt/2,se=C+_*Math.sin(1.42)*zt/2;if(n.obstacles.push({x1:Bt-.12,x2:Bt+.12,z1:se-zt/2,z2:se+zt/2,h:2.1,wall:!0}),U){let M=rn(.62,.2,wv("plate:"+U.name,Dr(U.name,{w:620,h:200,bg:"#ffffff",color:"#1c1f24",size:64,weight:700,radius:22,border:Gn(U.accent),sub:U.sub||null}),{rough:.4}),Mt+.5,1.58,C-_*.039);M.rotation.y=_>0?Math.PI:0,M.material=a(M.material,"G"),M.castShadow=!1,s.add(M)}continue}if(Mt-at<.06)continue;H(at,Mt,.03);let gt=Math.max(1,Math.round((Mt-at)/1.6)),ut=(Mt-at)/gt;for(let Tt=0;Tt<gt;Tt++){let dt=at+Tt*ut,zt=dt+ut;Tt>0&&Y(dt);let Bt=jt(ut-.05,he-.12,.012,a(x,"G"),(dt+zt)/2,he/2,C,{cast:!1});s.add(Bt);let se=jt(ut-.05,.36,.014,a(g,"G"),(dt+zt)/2,1.12,C,{cast:!1});s.add(se)}u(at,C-.05/2,Mt,C+.05/2),n.obstacles[n.obstacles.length-1].glass=!0}}function y(C,z,k,v,_,U){let B=rn(v-z,_-k,U,(z+v)/2,0,(k+_)/2);return B.rotation.x=-Math.PI/2,B.castShadow=!1,s.add(B),B}let R=(C,z,k,v,_,U)=>(z==="N"?(C.position.set(k,v,ft.z1+.002),C.rotation.y=0):z==="S"?(C.position.set(k,v,ft.z2-.002),C.rotation.y=Math.PI):z==="W"?(C.position.set(ft.x1+.002,v,k),C.rotation.y=Math.PI/2):z==="E"?(C.position.set(ft.x2-.012,v,k),C.rotation.y=-Math.PI/2):z==="pw"?(C.position.set(U-.072,v,k),C.rotation.y=-Math.PI/2):z==="pe"&&(C.position.set(U+.062,v,k),C.rotation.y=Math.PI/2),c(C,_||(z.length===1?z:"P")),s.add(C),C),A=(C,z)=>{let k=new ie;k.add(jt(C+.12,z+.12,.05,Pt.white(),0,0,.025));let v=rn(C,z,w,0,0,.052);v.castShadow=!1,k.add(v);let _=Math.max(1,Math.round(C/1.2));for(let U=1;U<_;U++)k.add(jt(.04,z,.03,Pt.white(),-C/2+U*C/_,0,.06));return k.add(jt(C+.2,.04,.14,Pt.white(),0,-z/2-.06,.07)),k},b=(C,z,k,v="#1c1f24",_=800)=>{let U=rn(z,k,Ye("wt:"+C+v,()=>new Ee({map:un(Dr(C,{w:Math.round(1024*Math.min(2,z/k/4)),h:256,color:v,size:170,weight:_,letter:4})),transparent:!0,depthWrite:!1})),0,0,.004);U.castShadow=!1,U.receiveShadow=!1;let B=new ie;return B.add(U),B},D=(C,z,k,v,_,U)=>{let B=Math.abs(k-z),H=new ie;return H.add(jt(B,he,.012,Pt.color(v,.9),0,0,.006,{cast:!1})),R(H,C,(z+k)/2,he/2,_,U)};n.groundMat=Ye("ground",()=>new le({color:14278112,roughness:1}));let W=rn(160,160,n.groundMat,0,-.16,0);W.rotation.x=-Math.PI/2,W.castShadow=!1,s.add(W),s.add(jt(ft.x2-ft.x1+1.6,.16,ft.z2-ft.z1+1.6,Ye("plinth",()=>new le({color:12896460,roughness:.9})),0,-.081,0,{cast:!1}));let Z=rn(ft.x2-ft.x1+14,ft.z2-ft.z1+14,Ye("lawn",()=>new le({color:13227715,roughness:1})),0,-.155,0);Z.rotation.x=-Math.PI/2,Z.castShadow=!1,s.add(Z);let J=rn(7,3.2,Ye("path",()=>new le({color:13619924,roughness:1})),ft.x2+4.3,-.15,0);J.rotation.x=-Math.PI/2,J.castShadow=!1,s.add(J);let rt=E("walnut",t.wood,10,7,[2.4,1.2],9071186,.42),K=E("oak",t.wood,7,7,[2.4,1.2],15785152,.45),ct=(C,z,k)=>E("terr"+C,qd(),z,k,[1.2,1.2],16777215,.35),tt=(C,z,k,v)=>E("carpet"+C,ma(z,C.length*7+3),k,v,[.6,.6],16777215,1),et=Ua;y("pres",et.presidencia.x1,et.presidencia.z1,et.presidencia.x2,et.presidencia.z2,rt),y("vendas",et.vendas.x1,et.vendas.z1,et.vendas.x2,et.vendas.z2,tt("vendas","#8fa3b3",11,7)),y("reuniao",et.reuniao.x1,et.reuniao.z1,et.reuniao.x2,et.reuniao.z2,K),y("recepcao",et.recepcao.x1,et.recepcao.z1,et.recepcao.x2,et.recepcao.z2,ct("rec",8,7)),y("corredor",ft.x1,ft.c1,ft.x2,ft.c2,ct("cor",36,3)),y("ops",et.operacoes.x1,et.operacoes.z1,et.operacoes.x2,et.operacoes.z2,tt("ops","#5d6b78",7,7)),y("mercado",et.mercado.x1,et.mercado.z1,et.mercado.x2,et.mercado.z2,tt("mercado","#b3a89a",6,7)),y("criativo",et.criativo.x1,et.criativo.z1,et.criativo.x2,et.criativo.z2,E("conc1",ph(3,"#d6d8da"),7,7,[3.5,3.5],16777215,.45)),y("ti",et.ti.x1,et.ti.z1,et.ti.x2,et.ti.z2,E("conc2",ph(8,"#b9bec4"),7,7,[3.5,3.5],16777215,.4)),y("fin",et.financeiro.x1,et.financeiro.z1,et.financeiro.x2,et.financeiro.z2,tt("fin","#9db0a6",5,7)),y("copa",et.copa.x1,et.copa.z1,et.copa.x2,et.copa.z2,E("tile",ga(),4,7,[.6,.6],16777215,.3));for(let C of[-1.32,1.32]){let z=rn(ft.x2-ft.x1-.4,.05,Pt.basic(15544887),0,.004,C);z.rotation.x=-Math.PI/2,z.castShadow=!1,s.add(z)}let _t=.22;S(ft.x1-_t,ft.z1-_t/2,ft.x2+_t,ft.z1-_t/2,"N",d,{t:_t,cast:!1}),S(ft.x1-_t,ft.z2+_t/2,ft.x2+_t,ft.z2+_t/2,"S",d,{t:_t,cast:!1}),V("z",ft.x2+_t/2,ft.z1,ft.z2,[[-1.15,1.15]],"E",d,{t:_t,cast:!1});let It=a(d,"W");It.clipShadows=!1;let wt=[{z:-6.6,w:2.2,y0:.9,y1:2.4,blinds:!0},{z:-3.4,w:2.2,y0:.9,y1:2.4,blinds:!0},{z:0,w:2,y0:.85,y1:2.45},{z:5,w:2.4,y0:.9,y1:2.4}];{let C=ft.z1,z=ft.x1-_t/2,k=(v,_,U)=>S(z,v,z,_,"W",d,{t:_t,...U});for(let v of wt){let _=v.z-v.w/2,U=v.z+v.w/2;k(C,_),k(_,U,{y1:v.y0}),k(_,U,{y0:v.y1,cap:!1,nav:!1}),C=U;let B=new ie,H=v.y1-v.y0,Y=Pt.white();B.add(jt(.06,.06,v.w+.1,Y,0,v.y0-.02,0)),B.add(jt(.26,.035,v.w+.16,Y,.1,v.y0-.005,0)),B.add(jt(.06,.06,v.w+.1,Y,0,v.y1+.02,0));for(let ot of[-1,1])B.add(jt(.06,H,.06,Y,0,v.y0+H/2,ot*(v.w/2+.02)));let pt=Math.max(1,Math.round(v.w/1.1));for(let ot=1;ot<pt;ot++)B.add(jt(.04,H,.035,Y,0,v.y0+H/2,-v.w/2+ot*v.w/pt));if(B.add(jt(.01,H,v.w,x,-.02,v.y0+H/2,0,{cast:!1})),v.blinds){let ot=Eh(v.w,H-.06,{tilt:-.55});ot.rotation.y=Math.PI/2,ot.position.set(.02,v.y0+H/2,0),B.add(ot)}B.position.set(ft.x1-.04,0,v.z),c(B,"W"),B.traverse(ot=>{ot.isMesh&&(ot.material.clipShadows=!1)}),s.add(B)}k(C,ft.z2)}for(let C of o.values())C.name.endsWith("@W")&&(C.clipShadows=!1);{let C=rn(110,30,w,ft.x1-34,11.5,0);C.rotation.y=Math.PI/2,C.castShadow=!1,C.receiveShadow=!1,C.userData.dynamic=!0,C.layers.set(0),C.material=new Ee({map:m[0],toneMapped:!1}),n.backdrop=C,r.add(C)}for(let C of[-8,3,10])S(C,ft.z1,C,ft.c1,"P");for(let C of[-11,-5,2,9,14])S(C,ft.c2,C,ft.z2,"P");O(ft.c1,-18,-8,[et.presidencia.door],-1,et.presidencia),O(ft.c1,-8,3,[et.vendas.door],-1,et.vendas),O(ft.c1,3,10,[et.reuniao.door],-1,et.reuniao),O(ft.c2,-18,-11,[et.operacoes.door],1,et.operacoes),O(ft.c2,-11,-5,[et.mercado.door],1,et.mercado),O(ft.c2,-5,2,[et.criativo.door],1,et.criativo),O(ft.c2,2,9,[et.ti.door],1,et.ti),O(ft.c2,9,14,[et.financeiro.door],1,et.financeiro);for(let[C,z,k,v]of[[3,ft.z1,ft.c1,14479334],[10,ft.z1,ft.c1,14673130],[-11,ft.c2,ft.z2,2042167],[-5,ft.c2,ft.z2,16509124],[2,ft.c2,ft.z2,15981048],[9,ft.c2,ft.z2,14280443],[14,ft.c2,ft.z2,13889513]]){let _=new ie;_.add(jt(Math.abs(k-z)-.12,he,.008,Pt.color(v,.92),0,0,.004,{cast:!1})),_.position.set(C-.062,he/2,(z+k)/2),_.rotation.y=-Math.PI/2,c(_,"P"),s.add(_)}{let C=new ie;C.add(jt(ft.z2-ft.c2-.3,he,.008,Pt.color(15981771,.92),0,0,.004,{cast:!1})),C.position.set(ft.x2-.003,he/2,(ft.c2+ft.z2)/2),C.rotation.y=-Math.PI/2,c(C,"E"),s.add(C)}for(let[C,z]of[[10,ft.c1],[14,ft.c2]])s.add(jt(.3,he,.3,a(d,"P"),C,he/2,z)),u(C-.15,z-.15,C+.15,z+.15);{let C=new ie;for(let z of[-1,1]){let k=new ie;k.add(jt(.012,2.1,1.08,x,0,1.06,z*.55,{cast:!1})),k.add(jt(.03,.05,1.1,p,0,2.1,z*.55)),k.add(jt(.03,.05,1.1,p,0,.03,z*.55)),k.add(jt(.03,2.1,.04,p,0,1.06,z*.02)),k.add(jt(.03,2.1,.04,p,0,1.06,z*1.09)),k.add(jt(.07,.5,.03,Pt.chrome(),0,1.1,z*.13)),C.add(k)}C.position.set(ft.x2+.1,0,0),c(C,"E"),s.add(C),u(ft.x2+.05,-1.15,ft.x2+.2,1.15)}let Qt=new ie;Qt.userData.dynamic=!0,r.add(Qt);{let C=rn(ft.x2-ft.x1,ft.z2-ft.z1,new le({color:16250869,roughness:.95,side:Oe,emissive:16777215,emissiveIntensity:.32}),0,he,0);C.rotation.x=Math.PI/2,C.castShadow=!1,C.receiveShadow=!1,Qt.add(C);let z=new Ee({color:16777215,toneMapped:!1});z.userData.bloom=!0;let k=new en(1.2,.02,.3),v=[];for(let B=ft.x1+2;B<ft.x2;B+=3){v.push([B,0,0]);for(let H of[-6.6,-3.6,3.6,6.6])v.push([B,H,1])}let _=new yr(k,z,v.length),U=new Yt;v.forEach((B,H)=>{U.makeRotationY((B[2],0)),U.setPosition(B[0],he-.012,B[1]),_.setMatrixAt(H,U)}),_.layers.enable(Zs),Qt.add(_)}n.ceiling=Qt;let st=(C,z,k,v,_,U=7,B=null)=>{let H=B?new ea(v,_,U,.62,.65,1.5):new ks(v,_,U,1.7);return H.position.set(C,z,k),B&&(H.target.position.set(...B),i.add(H.target)),H.userData.base=_,i.add(H),n.lamps.push(H),H},ht=(C,z,k,v=0)=>l(C,z,k,v,{y:he}),Et=Ye("logoRed",()=>new Ee({map:t.logo,transparent:!0})),mt=C=>{let z=7;for(let k of C)z=z*31+k.charCodeAt(0)>>>0;return z},Vt=(C,z,k={})=>{let v=C.userData.screenMesh;return v&&(v.userData.screen=Object.assign(v.userData.screen||{},{title:z},k)),C};function Gt(C,z,k,v,_,{chair:U=Nr(),rollBack:B=.5,kind:H="desk",visitor:Y=null}={}){let pt=kh(_),ot=mt(C),at={id:C,room:z,pos:new I(k,0,v),yaw:_,rollBack:B,kind:H,by:null,visitor:Y,chair:U,rolled:1,free:!0,rest:(ot%100/100-.5)*.62,swivel:(ot%100/100-.5)*.62};return Av(U),U.userData.dynamic=!0,U.traverse(Mt=>{Mt.userData.dynamic=!0}),l(U,0,0,_,{dyn:!0}),n.chairs.push(at),n.seats.set(C,at),Zt(at),at}function Zt(C){let z=kh(C.yaw),k=.09-C.rollBack*C.rolled;C.chair.position.set(C.pos.x+z.x*k,0,C.pos.z+z.z*k),C.chair.rotation.y=C.yaw+(C.swivel||0)}n.placeChair=Zt;function fe(C,z,k){let v=kh(C.yaw),_=.34+k/2;return l(z,C.pos.x+v.x*_,C.pos.z+v.z*_,C.yaw,{nav:!0}),z}let Dt=(C,z,k,v,_=0,U=.74)=>(z.position.set(k,U,v),z.rotation.y=_,C.add(z),z),pe=(C,z,k,{mouse:v=!0,dx:_=.1,y:U=.795}={})=>{z.updateMatrixWorld(!0);let B=(H,Y,pt)=>z.localToWorld(new I(H,Y,pt));C.kb=[B(_,U,k+.035),B(-_,U,k+.035)],C.mouse=v?B(-.32,U-.005,k+.05):null};function F(C,z,k,v,_,U="stand"){let B={id:C,room:z,pos:new I(k,0,v),yaw:_,kind:U,by:null};return n.spots.set(C,B),B}let Ie=(C,z,k={})=>Mh({w:k.w||.6,h:k.h||.34,tex:Hn(z,k),key:C});function Rt(C,z,k,v,_,{w:U=1.6,screens:B=[["crm",1]],accent:H,top:Y,extras:pt=!0,visitor:ot}={}){let at=Gt(C,z,k,v,_,{visitor:ot}),Mt=.75,lt=fe(at,Ur({w:U,d:Mt,top:Y||Pt.white()}),Mt),gt=B.length;if(B.forEach(([ut,Tt],dt)=>{let zt=Ie(`${C}:${dt}`,ut,{seed:Tt,accent:Gn(H||15544887)}),Bt=(dt-(gt-1)/2)*.64;Dt(lt,zt,Bt,.16,Math.PI+(gt>1?-(dt-(gt-1)/2)*.22:0))}),Dt(lt,Fr(),0,-.265,Math.PI),lt.traverse(ut=>{ut.userData.screen&&(ut.userData.screen.owner=C)}),pe(at,lt,-Mt/2),at.monitors=B.map((ut,Tt)=>lt.localToWorld(new I((Tt-(gt-1)/2)*.64,1.16,.16))),pt){let ut=mt(C);Dt(lt,ut%3===0?Br(Et):Ri([16777215,15544887,1842980,16096779][ut%4]),-U/2+.17,-.2,ut%7*.4),ut%2&&Dt(lt,Ma([4891615,7327639,12434877][ut%3]),U/2-.1,.22),ut%3===1?Dt(lt,Sa(),U/2-.3,-.16,.5+ut%5*.2):ut%3===2?Dt(lt,ba([15911244,15544887,3113197][ut%3]),U/2-.27,-.16,.25):Dt(lt,zr(2),U/2-.25,-.12,.3)}return at}{let C=et.presidencia,z=-12.8,k=new ie,v=Ye("slats",()=>new le({map:(()=>{let ut=un(Yd());return ut.wrapS=ut.wrapT=On,ut.repeat.set(14,1),ut})(),roughness:.55}));k.add(jt(5.6,he-.02,.05,v,0,0,.025,{cast:!1})),R(k,"N",z,he/2);let _=new ie;_.add(jt(4.1,1.42,.07,Pt.color(1382170,.4,.4),0,0,.035,{r:.02}));let U=rn(4,1.32,Ye("lightbox",()=>{let ut=new le({color:16777215,emissive:16777215,emissiveIntensity:.62,roughness:.5});return ut.userData.bloom=!0,ut}),0,0,.072);U.castShadow=!1,_.add(U);let B=rn(3.6,3.6*154/500,Et,0,0,.078);B.castShadow=!1,_.add(B);let H=rn(4.9,2.1,Ye("glow",()=>new Ee({map:un((()=>{let ut=qe(256,128),Tt=ut.getContext("2d"),dt=Tt.createRadialGradient(128,64,10,128,64,128);return dt.addColorStop(0,"rgba(255,240,225,0.55)"),dt.addColorStop(1,"rgba(255,240,225,0)"),Tt.fillStyle=dt,Tt.fillRect(0,0,256,128),ut})()),transparent:!0,depthWrite:!1,blending:Co})),0,0,.052);H.castShadow=!1,_.add(H),R(_,"N",z,2.02),n.logoWall=new I(z,2.02,ft.z1);let Y=1.2,pt=Y*505/1200,ot=Gr({w:Y,h:pt,tex:t.dollar,key:"dollar",frame:Pt.brass(),mat:.13,fw:.05,depth:.045,glass:!0}),at=new ie;at.add(jt(.7,.03,.05,Pt.brass(),0,pt/2+.32,.17)),at.add(jt(.03,.03,.17,Pt.brass(),0,pt/2+.32,.085));let Mt=jt(.62,.008,.035,Pt.emissive(16773327,2.2),0,pt/2+.303,.17,{cast:!1});at.add(Mt),ot.add(at),R(ot,"N",-9.12,1.62),n.dollar=new I(-9.12,1.62,ft.z1);let lt=Gt("thiago","presidencia",z,-6.75,0,{chair:Nr({fabric:Pt.leather(),exec:!0}),visitor:[[z,-4.4],[z+1.75,-4.95]]}),gt=fe(lt,_h(),1);Dt(gt,Or(Hn("chart",{seed:4,accent:"#ed3237",title:"Bal\xE3o \xB7 vis\xE3o geral"}),"lap:thiago"),0,-.3,Math.PI,.755),pe(lt,gt,-.5,{mouse:!1,dx:.085,y:.8}),gt.traverse(ut=>{ut.userData.screen&&(ut.userData.screen.owner="thiago")}),lt.monitors=[gt.localToWorld(new I(0,.9,-.2))],Dt(gt,Th(e.president.name.toUpperCase(),e.president.title.toUpperCase()),0,.4,0,.75),Dt(gt,bh(),.92,.12,2.4,.75),Dt(gt,kr(),.62,-.1,Math.PI+.3,.75),Dt(gt,zr(4),-.62,-.08,.2,.755),Dt(gt,Br(Et),-.92,.15,.6,.75),Dt(gt,ba(1842980),.55,-.3,-.2,.755),l(qs(4.6,3.3,3422013,11610671),z,-5.7),l(va(Pt.leatherTan()),z-.85,-4.8,Math.PI+.14,{nav:!0}),l(va(Pt.leatherTan()),z+.85,-4.8,Math.PI-.14,{nav:!0}),l(qs(3.2,3,9277331),-16.25,-3.45),l(Gs({w:2.3,fabric:Pt.leather()}),-17.42,-3.45,Math.PI/2,{nav:!0}),l(ya({}),-16.05,-3.45,Math.PI/2,{nav:!0}),l(Ws(Pt.leatherTan()),-15.05,-2.7,-Math.PI/2-.25,{nav:!0}),l(Ws(Pt.leatherTan()),-15.05,-4.15,-Math.PI/2+.25,{nav:!0}),l(Ch(),-17.45,-1.95),l(Ea({w:2}),-17.72,-6.6,Math.PI/2,{nav:!0});{let ut=new ie;ut.add(Wr(.06,.08,.04,Pt.darkWood(),0,.02,0,16)),ut.add(Wr(.02,.02,.14,Pt.brass(),0,.11,0,8));let Tt=Wr(.07,.035,.14,Pt.brass(),0,.25,0,16);ut.add(Tt),l(ut,-17.72,-6.1,0,{y:.72});let dt=new qt(new Ko(.15,24,16),Pt.color(2776463,.4));dt.position.set(-17.72,.72+.22,-7.15),dt.castShadow=!0,s.add(dt),s.add(Wr(.08,.1,.05,Pt.brass(),-17.72,.745,-7.15,16))}l(Xs({w:2.6,h:2.2,seed:3}),-8.24,-4.6,-Math.PI/2,{nav:!0}),l(xe({h:1.7,pot:Pt.potDark()}),-17.4,-8),l(xe({h:1.4,pot:Pt.potDark(),kind:1}),-8.55,-2.05),st(-17.4,1.55,-1.95,16767400,5.5,6.5),st(-11.85,1.15,-5.75,16769720,2.6,3.6),st(-9.12,2.72,-7.55,16773334,22,4.5,[-9.12,1.6,-8.5]),st(z,2.7,-7.3,16774114,20,6,[z,1.2,-8.4]),l(xe({h:1.5,pot:Pt.potDark(),kind:2}),-10.6,-8),F("pres.window","presidencia",-16.4,-5.1,-Math.PI/2,"phone"),F("pres.lounge","presidencia",-15.9,-5.6,-2.4,"stand")}{let z=et.vendas.accent;D("N",-8+.06,3-.06,15332848);let k=(v,_)=>[v,_];Rt("julia","vendas",-5.9,-7.15,0,{screens:[k("crm",2),k("chart",3)],accent:z,visitor:[[-5.9,-5.25]]}),Rt("vendas","vendas",-2.5,-7.15,0,{w:1.8,screens:[k("chart",5),k("crm",6)],accent:z,visitor:[[-2.5,-5.25]]}),Rt("vitoria","vendas",.9,-7.15,0,{screens:[k("crm",7),k("sheet",8)],accent:z,visitor:[[.9,-5.25]]}),Rt("claudia","vendas",-5.9,-3,Math.PI,{screens:[k("crm",9),k("pix",10)],accent:z,visitor:[[-4.65,-3.2]]}),Rt("maria","vendas",-2.5,-3,Math.PI,{screens:[k("chart",11),k("sheet",12)],accent:z,visitor:[[-1.25,-3.2]]}),R(Vt($i({w:2,h:1.12,tex:Hn("chart",{seed:21,accent:Gn(z),title:"Painel de vendas"}),key:"tv:vendas"}),"Painel de vendas"),"N",-2.5,2.02),ht(Hr(3,.62),-4.2,-6.45),ht(Hr(3,.62),-.8,-6.45),ht(Hr(3.4,.62),-4.2,-3.7),st(-2.5,2.2,-6.3,16054271,7.5,8),st(-4.2,2.2,-3.6,16054271,6.5,7),R(b("VENDAS",1.9,.42,Gn(z)),"N",-6.3,2.3),R(Vr({w:2,h:1.1,seed:4,accent:Gn(z)}),"pw",-4,1.55,"P",3),l(Ra({w:1.4}),1.6,-3.4,0,{nav:!0}),l(Vs(),1.1,-2.85),l(Vs(),2.1,-2.85);{let v=l(wa(),2.62,-5.6,-Math.PI/2,{nav:!0}),_=new ie;_.position.copy(v.position),_.rotation.y=v.rotation.y,_.userData.dynamic=!0,r.add(_),n.printer={group:_,sheets:[]}}l(xe({h:1.5,kind:2}),-7.5,-2.05),l(xe({h:1.3,kind:1}),2.55,-7.95),l(Ys(),-4.2,-7.9),l(xe({h:1.2}),-7.5,-4.9),F("vendas.board","vendas",1.9,-4.5,Math.PI/2,"present"),F("vendas.t1","vendas",1.15,-4,0,"table"),F("vendas.t2","vendas",2.1,-4,0,"table"),F("vendas.printer","vendas",1.95,-5.6,Math.PI/2,"docs")}{l(qs(5,3.6,5595243),6.5,-5.1),l(yh({w:3.4,d:1.2}),6.5,-5.1,0,{nav:!0});let _=1,U=(B,H,Y)=>Gt("reuniao.s"+_++,"reuniao",B,H,Y,{chair:Nr({fabric:Pt.fabricGray()}),kind:"meeting",rollBack:.45});for(let B of[5.4,6.5,7.6])U(B,-5.1-1.2/2-.34,0);for(let B of[5.4,6.5,7.6])U(B,-5.1+1.2/2+.34,Math.PI);U(6.5-3.4/2-.34,-5.1,Math.PI/2);for(let B of n.chairs.filter(H=>H.kind==="meeting"))B.rolled=.35,Zt(B);R(Vt($i({w:2.3,h:1.3,tex:Hn("dash",{seed:31,accent:"#ed3237",title:"Pauta da reuni\xE3o"}),key:"tv:reuniao"}),"Pauta da reuni\xE3o"),"N",6.5,1.8);for(let B of[5.4,6.5,7.6])ht(Vn({r:.19,drop:.78}),B,-5.1);st(6.5,1.85,-5.1,16769725,9.5,8),R(Vr({w:2.2,h:1.15,seed:9}),"pw",-5.2,1.55,"P",10),l(Ea({w:1.8,wood:Pt.oak(),front:Pt.white()}),3.34,-6.4,Math.PI/2,{nav:!0}),l(xe({h:1.6}),9.45,-8),l(xe({h:1.3,kind:1}),9.4,-2.1);{let B=Ri(16777215);l(B,6.5-.5,-5.1+.2,0,{y:.76}),l(zr(3),6.5+.6,-5.1-.15,.4,{y:.76}),l(Or(Hn("sheet",{seed:2}),"lap:reuniao"),6.5-.2,-5.1-.25,Math.PI,{y:.76})}F("reuniao.present","reuniao",8.45,-7.55,.15,"present")}{D("N",10.06,18,16777215);let C=new ie;C.add(jt(4.6,1.7,.05,Pt.color(16777215,.5),0,0,.025,{r:.02}));let z=rn(4.1,4.1*154/500,Ye("logoRed2",()=>new Ee({map:t.logo,transparent:!0})),0,0,.056);z.castShadow=!1,C.add(z),C.add(jt(4.6,.05,.06,Pt.red(),0,-.88,.03)),R(C,"N",14.3,1.95);let k=Nh(t.logoWhite);l(k,14.3,-5,0,{nav:!0});let v=Gt("recepcao","recepcao",14.3,-5.81,0,{visitor:[[14.3,-3.75]]}),_=Ie("rec:0","crm",{seed:41});_.position.set(-.5,.755,-.05),_.rotation.y=Math.PI-.25,k.add(_);let U=Fr(!1);U.position.set(0,.755,-.36),U.rotation.y=Math.PI,k.add(U),pe(v,k,-.47,{y:.8}),v.monitors=[k.localToWorld(new I(-.5,1.15,-.05))];let B=kr();B.position.set(.7,.755,-.25),B.rotation.y=Math.PI,k.add(B);for(let H of[13.5,15.1])ht(Vn({color:Pt.red(),r:.21,drop:.72}),H,-4.72);st(14.3,1.9,-4.55,16770760,8.5,8),l(qs(3.6,3,12038824),11.9,-5.4),l(Gs({w:2.3,fabric:Pt.fabricRed()}),10.52,-5.4,Math.PI/2,{nav:!0}),l(ya({top:Pt.white()}),11.95,-5.4,Math.PI/2,{nav:!0}),l(Ws(Pt.fabricGray()),11.9,-7.35,0,{nav:!0}),l(xe({h:1.8,kind:2}),10.5,-8),l(xe({h:1.6,kind:1}),17.45,-8),l(xe({h:1.4}),17.45,-1.95),l(Aa(),17.6,-6.4,-Math.PI/2,{nav:!0}),R(A(2.6,1.6),"E",-4.4,1.65);{let H=jt(1.6,.012,2,Pt.color(3816770,1),16.9,.006,0,{cast:!1});s.add(H)}R(Ph(),"E",-6.9,2.15),F("recepcao.wait","recepcao",12.9,-3.2,2.4,"stand")}{let z=et.operacoes.accent,k=qe(1024,576),v=un(k),_=new Ee({map:v,toneMapped:!1});_.name="videowall",_.userData.bloom=!0;let U=$i({w:3.5,h:1.97,tex:_});U.userData.screenMesh.userData.screen={canvas:k,w:3.5,h:1.97,title:"Central de orquestra\xE7\xE3o",live:!0},R(U,"pw",5,1.72,"P",-11),n.videoWall={canvas:k,tex:v},st(-12.1,1.7,5,8376575,5.5,6.5),ht(Vn({r:.22,drop:.8}),-16.4,3.3),st(-16.4,1.8,3.3,16769725,6,6);let B=Gt("hermes","operacoes",-14.35,5,Math.PI/2,{visitor:[[-14.2,3.35],[-14.2,6.7]]}),H=fe(B,Ur({w:2.3,d:.8,top:Pt.color(2303531,.5)}),.8);[["dash",51],["terminal",52],["chart",53]].forEach(([Y,pt],ot)=>{let at=Ie("ops:"+ot,Y,{seed:pt,accent:Gn(z)});Dt(H,at,(ot-1)*.66,.18,Math.PI-(ot-1)*.3)}),H.traverse(Y=>{Y.userData.screen&&(Y.userData.screen.owner="hermes")}),pe(B,H,-.4),B.monitors=[-1,0,1].map(Y=>H.localToWorld(new I(Y*.66,1.16,.18))),Dt(H,Sa(),.95,.15,.4),Dt(H,Ma(4891615),-1.02,.2),Dt(H,Fr(),0,-.29,Math.PI),Dt(H,Ri(1842980),-.9,-.15),Dt(H,kr(),.9,-.12,Math.PI),l(vh({r:.5,h:1.06,top:Pt.oak()}),-16.4,3.3,0,{nav:!0}),F("ops.t1","operacoes",-16.4,2.5,0,"table"),F("ops.t2","operacoes",-17.15,3.6,1.9,"table"),F("ops.wall","operacoes",-12.6,6.9,1.2,"think"),l(Xs({w:2,h:1.3,wood:Pt.white(),seed:8}),-17.8,6.6,Math.PI/2,{nav:!0}),l(xe({h:1.6}),-17.4,8),l(xe({h:1.3,kind:1}),-11.5,2.05),l(Gs({w:1.9,fabric:Pt.fabricBlue()}),-14.6,8.02,Math.PI,{nav:!0})}{let C=et.mercado.accent;Rt("mercado","mercado",-8.6,4.3,0,{w:1.8,screens:[["prices",61],["sheet",62]],accent:C,visitor:[[-8.6,6.45]]}),R(Vt($i({w:1.9,h:1.07,tex:Hn("prices",{seed:63,accent:Gn(C),title:"Monitor de pre\xE7os"}),key:"tv:mercado"}),"Monitor de pre\xE7os"),"pw",5.3,1.72,"P",-5),ht(Vn({r:.2,drop:.8}),-8.6,5),st(-8.6,1.8,5,16769725,6.5,6.5),R(Vr({w:1.8,h:1,seed:6,accent:Gn(C)}),"pe",6.2,1.55,"P",-11),l(Xs({w:2.2,h:1.9,wood:Pt.oak(),seed:12}),-8.3,8.3,Math.PI,{nav:!0}),l(xe({h:1.5}),-10.5,8),l(xe({h:1.2,kind:1}),-5.55,2.1),l(Ys(),-10.1,4.1),F("mercado.tv","mercado",-6.35,5.3,Math.PI/2,"think"),F("mercado.board","mercado",-9.9,6.2,-Math.PI/2,"present")}{let C=et.criativo.accent,z=Rt("criativo","criativo",-3.3,4.3,0,{w:1.9,screens:[["design",71]],accent:C,top:Pt.oak(),visitor:[[-3.3,6.5]]}),k=Pt.color(16757310,.9),v=jt(.03,2.5,2.8,k,1.9,1.25,5.7,{cast:!1});s.add(v);let _=jt(1.7,.012,2.8,k,1.05,.006,5.7,{cast:!1});s.add(_);let U=Wr(.05,.05,2.9,Pt.blackMetal(),1.88,2.52,5.7,12);U.rotation.x=Math.PI/2,s.add(U),l(Oh(.8),1.15,5.7,0,{nav:!0}),l(Pa(),1.15,5.7,-Math.PI/2-.5,{y:.8}),l(Ca(),-.05,4.2,.95,{nav:!0}),l(Ca(),-.05,7.2,2.2,{nav:!0}),l(Fh(),-.55,5.7,Math.PI/2,{nav:!0}),l(Sh(),.45,4.55,.9,{nav:!0}),st(0,1.9,4.25,16773854,26,6,[1.15,1,5.7]),st(0,1.9,7.15,16773854,22,6,[1.15,1,5.7]),ht(Vn({color:Pt.color(14239471,.5),r:.2,drop:.8}),-3.3,5),st(-3.3,1.8,5,16769725,6,6.5),F("criativo.photo","criativo",-1.15,5.7,Math.PI/2,"work"),[0,1,2].forEach(B=>R(Gr({w:.62,h:.87,tex:Jd(B+2),key:"poster"+B,frame:Pt.black()}),"pe",3.2+B*.95,1.7,"P",-5)),l(Xs({w:1.6,h:1.5,wood:Pt.white(),seed:5}),-3.6,8.3,Math.PI,{nav:!0}),l(xe({h:1.6,kind:1}),-4.5,8),l(xe({h:1.3,kind:2}),1.5,2.1),l(Ws(Pt.color(14239471,.9)),-4.35,6.5,Math.PI/2+.3,{nav:!0}),F("criativo.posters","criativo",-3.95,2.6,-Math.PI/2,"think")}{let C=et.ti.accent;Rt("ti","ti",4.2,4.3,0,{w:2,screens:[["terminal",81],["code",82],["dash",83]],accent:C,top:Pt.color(2829875,.5),visitor:[[4.2,6.5]]});for(let k=0;k<4;k++){let v=Ah(k+1);l(v,8.48,3.75+k*.76,-Math.PI/2,{nav:k===0}),v.updateMatrixWorld(!0);for(let _ of v.userData.leds)n.leds.push({..._,m:new Yt().makeTranslation(_.pos[0],_.pos[1],_.pos[2]).premultiply(v.matrixWorld)})}u(7.95,3.35,9,6.45,2.05);{let k=new ie;k.add(jt(.06,.012,3.3,Pt.color(16096779,.8),0,.006,0,{cast:!1})),l(k,7.72,4.9)}let z=Ur({w:1.9,d:.7,h:.92,top:Pt.oak(),modesty:!1});l(z,2.48,6.7,Math.PI/2,{nav:!0});{let k=wh();k.position.set(.05,.92,.12),k.rotation.y=.2,z.add(k)}n.rackLight=st(7.55,1.3,4.9,6271231,4.5,5.5),ht(Vn({r:.2,drop:.8}),4.2,5),st(4.2,1.8,5,15857151,6.5,6.5);{let k=Pa(!1);k.position.set(-.62,.92,0),k.rotation.z=Math.PI/2,k.position.y=.92+.11,z.add(k);let v=Or(Hn("terminal",{seed:85}),"lap:ti");v.position.set(.66,.92,-.16),v.rotation.y=-.3,z.add(v)}R(Vt($i({w:1.7,h:.96,tex:Hn("dash",{seed:84,accent:Gn(C),title:"Monitoramento \xB7 VPS"}),key:"tv:ti"}),"Monitoramento dos servidores"),"pe",3.9,1.85,"P",2),l(Ta({w:.6,h:1,color:Pt.color(3817287,.5,.4)}),2.42,8.1,Math.PI/2,{nav:!0}),l(xe({h:1.3}),8.45,8),l(Ys(),5.6,4.1),F("ti.rack","ti",7.3,5.25,Math.PI/2,"workMid"),F("ti.bench","ti",3.25,6.7,-Math.PI/2,"work")}{let C=et.financeiro.accent;Rt("financeiro","financeiro",11.1,4.3,0,{w:1.7,screens:[["pix",91],["sheet",92]],accent:C,visitor:[[11.1,6.45]]});for(let z=0;z<3;z++)l(Ta({}),13.66,4.6+z*.56,-Math.PI/2,{nav:z===0});u(13.3,4.3,14,6.05,1.3),l(Rh(),13.62,7.7,-Math.PI/2,{nav:!0}),ht(Vn({r:.2,drop:.8}),11.1,5),st(11.1,1.8,5,16769725,6.5,6.5),R(Gr({w:1.5,h:.85,tex:Hn("chart",{seed:93,accent:Gn(C),title:"Fluxo de caixa"}),key:"fr:fin",frame:Pt.white(),mat:.04}),"pe",5.3,1.65,"P",9),l(xe({h:1.5}),9.5,8),l(xe({h:1.1,kind:1}),9.5,2.1),l(wa(),9.42,6.9,Math.PI/2,{nav:!0}),F("fin.files","financeiro",12.85,5.15,Math.PI/2,"docs")}{let C=Ih({w:3.4});l(C,17.68,4.6,-Math.PI/2,{nav:!0});{let z=Dh();z.position.set(-.75,.9,0),C.add(z);let k=Lh();k.position.set(.85,.9,-.05),C.add(k),[0,1,2].forEach(v=>{let _=v===0?Br(Et):Ri([16777215,15544887,1842980][v]);_.position.set(-.2+v*.13,.9,.1-v%2*.1),_.rotation.y=Math.PI/2,C.add(_)})}l(Uh(),17.6,7.2,-Math.PI/2,{nav:!0}),ht(Vn({color:Pt.color(11817737,.5),r:.24,drop:.7}),15.35,5.2),st(15.35,1.85,5.2,16767400,7.5,6.5),l(Ra({w:1.5}),15.35,5.2,Math.PI/2,{nav:!0}),l(Vs(),14.75,4.7),l(Vs(),14.75,5.7),l(Aa(),14.38,8.05,0,{nav:!0}),l(xe({h:1.5}),17.45,8.05),l(Ys(),16.9,2.4),R(A(1.6,1),"E",7.7,2,"E"),R(b("CAF\xC9",1.1,.34,"#b45309"),"pe",3.6,2.25,"P",14),F("copa.machine","copa",16.85,3.85,Math.PI/2,"coffee"),F("copa.t1","copa",14.72,5.2,Math.PI/2,"drink"),F("copa.t2","copa",15.98,4.75,-Math.PI/2,"drink"),F("copa.t3","copa",15.98,5.65,-Math.PI/2,"drink"),F("copa.water","copa",14.5,7.35,.25,"drink")}l(xe({h:1.7,pot:Pt.potDark()}),-17.5,-1),l(xe({h:1.7,pot:Pt.potDark()}),-17.5,1),l(Ia(1.5),-3.2,-1.2,0,{nav:!0}),l(Ia(1.5),7.4,1.2,0,{nav:!0}),l(xe({h:1.4,kind:1}),-6.6,-1.15),l(xe({h:1.4,kind:1}),.4,1.15),l(xe({h:1.4}),10.6,1.15),F("cor.a1","corredor",-9,.5,Math.PI/2,"chat"),F("cor.a2","corredor",-7.9,.5,-Math.PI/2,"chat"),F("cor.b1","corredor",3.2,-.5,Math.PI/2,"chat"),F("cor.b2","corredor",4.3,-.5,-Math.PI/2,"chat"),n.clock=null,s.traverse(C=>{C.userData.hands&&(n.clock=C.userData.hands)});{let C=new yr(new vn(.018,.018),new Ee({color:16777215,toneMapped:!1}),n.leds.length);C.layers.enable(Zs);let z=new Wt;n.leds.forEach((k,v)=>{C.setMatrixAt(v,k.m),C.setColorAt(v,z.set(k.color)),k.c=new Wt(k.color)}),C.userData.dynamic=!0,C.frustumCulled=!1,r.add(C),n.ledMesh=C}s.updateMatrixWorld(!0);{let C=new Ee({visible:!1});s.traverse(z=>{if(!z.isMesh||!z.userData.screen)return;let k=z.userData.screen,v=new qt(new vn(k.w,k.h),C);z.matrixWorld.decompose(v.position,v.quaternion,v.scale),v.userData.dynamic=!0,v.userData.screenInfo=k,n.screens.push({mesh:v,info:k}),r.add(v)})}Rv(s,r),r.traverse(C=>{C.isMesh&&C.material&&C.material.userData&&C.material.userData.bloom&&C.layers.enable(Zs)}),n.rgbMats=xh().filter(C=>C.userData.rgb!==void 0),n.staticRoot=s,n.dynRoot=r,n.update=(C,z)=>{n.alertShown=(n.alertShown||0)+(n.serverAlert-(n.alertShown||0))*Math.min(1,z*2.5);let k=n.alertShown;{let v=n.ledMesh;for(let _=0;_<n.leds.length;_++){let U=n.leds[_];if(!(Math.sin(C*U.rate*(1+k*2.2)+U.phase)>-.55+k*.5)){v.setColorAt(_,Ev);continue}k>.02?(tf.copy(U.c).lerp(_%3?Qd:Tv,k),v.setColorAt(_,tf)):v.setColorAt(_,U.c)}v.instanceColor.needsUpdate=!0}n.rackLight&&n.rackLight.color.setHex(6271231).lerp(Qd,k);for(let v of n.rgbMats)v.emissive.setHSL((C*.07+v.userData.rgb)%1,.95,.55);for(let v of n.chairs)v.free&&Math.abs((v.swivel||0)-v.rest)>.002&&(v.swivel+=(v.rest-v.swivel)*Math.min(1,z*2.5),Zt(v));if(n.printer){for(let v of n.printer.sheets)if(v.userData.t<1){v.userData.t=Math.min(1,v.userData.t+z/2.6);let _=v.userData.t;v.position.z=.1+.25*_,v.position.y=.727+v.userData.n*.0025+(1-_)*.004}}if(n.clock){let v=new Date,_=v.getMinutes()+v.getSeconds()/60,U=v.getHours()%12+_/60;n.clock[0].rotation.z=-U/12*Math.PI*2,n.clock[1].rotation.z=-_/60*Math.PI*2}},n.print=()=>{let C=n.printer;if(!C)return;if(C.sheets.length>=8){for(let k of C.sheets)C.group.remove(k);C.sheets.length=0}let z=new qt(new en(.21,.0016,.297),Pt.paper());z.userData={t:0,n:C.sheets.length,dynamic:!0},z.position.set((Math.random()-.5)*.02,.73,.1),z.rotation.y=(Math.random()-.5)*.12,z.castShadow=!1,C.group.add(z),C.sheets.push(z)};let Jt={N:50,S:50,E:50,W:50,P:50,G:50};return n.setCut=(C,z,k=!1)=>{for(let v in Jt){let _=C[v]??50,U=k?1:1-Math.exp(-z*7),B=Math.min(Jt[v],he+.25),H=Math.min(_,he+.25),Y=B+(H-B)*U;Math.abs(Y-H)<.004&&(Y=H),Jt[v]=Y>=he+.24?50:Y,n.planes[v].constant=Jt[v];let pt=Jt[v]<he-.01;for(let ot of n.caps[v])ot.visible=pt,ot.position.y=Jt[v]+.001}},n}function Av(i){i.position.set(0,0,0),i.rotation.set(0,0,0),i.updateMatrixWorld(!0);let t=new Map;for(i.traverse(e=>{if(!e.isMesh)return;let n=e.material.uuid;t.has(n)||t.set(n,{mat:e.material,geos:[]});let s=e.geometry.index?e.geometry.toNonIndexed():e.geometry.clone();for(let r of Object.keys(s.attributes))["position","normal","uv"].includes(r)||s.deleteAttribute(r);s.applyMatrix4(e.matrixWorld),t.get(n).geos.push(s)});i.children.length;)i.remove(i.children[0]);for(let e of t.values()){let n=new qt(fh(e.geos,!1),e.mat);n.castShadow=!0,n.receiveShadow=!0,i.add(n)}return i}function Rv(i,t){i.updateMatrixWorld(!0);let e=new Map,n=[];i.traverse(s=>{if(!s.isMesh)return;let r=!1;for(let c=s;c;c=c.parent)if(c.userData&&c.userData.dynamic){r=!0;break}if(r||s.isInstancedMesh){n.push(s);return}let o=s.material.uuid+(s.castShadow?"c":"n")+(s.receiveShadow?"r":"n");e.has(o)||e.set(o,{mat:s.material,cast:s.castShadow,recv:s.receiveShadow,geos:[]});let a=s.geometry.index?s.geometry.toNonIndexed():s.geometry.clone();for(let c of Object.keys(a.attributes))["position","normal","uv"].includes(c)||a.deleteAttribute(c);a.attributes.uv||a.setAttribute("uv",new Te(new Float32Array(a.attributes.position.count*2),2)),a.attributes.normal||a.computeVertexNormals(),a.applyMatrix4(s.matrixWorld),e.get(o).geos.push(a)});for(let s of n){let r=s.matrixWorld.clone(),o=s;for(;o.parent&&o.parent!==i&&o.parent.userData&&o.parent.userData.dynamic;)o=o.parent;if(o.userData.__moved)continue;let a=o.matrixWorld.clone();t.add(o),a.decompose(o.position,o.quaternion,o.scale),o.userData.__moved=!0}for(;i.children.length;)i.remove(i.children[0]);for(let s of e.values()){let r=fh(s.geos,!1);if(!r)continue;let o=new qt(r,s.mat);o.castShadow=s.cast,o.receiveShadow=s.recv,o.matrixAutoUpdate=!1,s.mat.userData&&s.mat.userData.bloom&&o.layers.enable(Zs),i.add(o),s.geos.forEach(a=>a.dispose())}}var Na=class{constructor(t,e,{cell:n=.2,wallPad:s=.3,objPad:r=.24}={}){this.cell=n,this.x0=t.x1,this.z0=t.z1,this.nx=Math.ceil((t.x2-t.x1)/n),this.nz=Math.ceil((t.z2-t.z1)/n),this.blocked=new Uint8Array(this.nx*this.nz);for(let o of e)this.block(o.x1,o.z1,o.x2,o.z2,o.wall?s:r);for(let o=0;o<this.nx;o++)this.blocked[o]=1,this.blocked[(this.nz-1)*this.nx+o]=1;for(let o=0;o<this.nz;o++)this.blocked[o*this.nx]=1,this.blocked[o*this.nx+this.nx-1]=1}block(t,e,n,s,r=0){let o=Math.max(0,Math.floor((t-r-this.x0)/this.cell)),a=Math.min(this.nx-1,Math.floor((n+r-this.x0)/this.cell)),c=Math.max(0,Math.floor((e-r-this.z0)/this.cell)),h=Math.min(this.nz-1,Math.floor((s+r-this.z0)/this.cell));for(let l=c;l<=h;l++)for(let u=o;u<=a;u++){let d=this.x0+(u+.5)*this.cell,f=this.z0+(l+.5)*this.cell;d>=t-r&&d<=n+r&&f>=e-r&&f<=s+r&&(this.blocked[l*this.nx+u]=1)}}blockCircle(t,e,n){let s=Math.ceil(n/this.cell),r=Math.floor((t-this.x0)/this.cell),o=Math.floor((e-this.z0)/this.cell);for(let a=o-s;a<=o+s;a++)for(let c=r-s;c<=r+s;c++){if(c<0||a<0||c>=this.nx||a>=this.nz)continue;let h=this.x0+(c+.5)*this.cell,l=this.z0+(a+.5)*this.cell;(h-t)**2+(l-e)**2<=n*n&&(this.blocked[a*this.nx+c]=1)}}cellOf(t,e){return[Math.min(this.nx-1,Math.max(0,Math.floor((t-this.x0)/this.cell))),Math.min(this.nz-1,Math.max(0,Math.floor((e-this.z0)/this.cell)))]}isBlocked(t,e){let[n,s]=this.cellOf(t,e);return this.blocked[s*this.nx+n]===1}nearestFree(t,e){if(!this.blocked[e*this.nx+t])return[t,e];for(let n=1;n<14;n++){let s=null,r=1e9;for(let o=-n;o<=n;o++)for(let a=-n;a<=n;a++){if(Math.max(Math.abs(a),Math.abs(o))!==n)continue;let c=t+a,h=e+o;if(c<0||h<0||c>=this.nx||h>=this.nz||this.blocked[h*this.nx+c])continue;let l=a*a+o*o;l<r&&(r=l,s=[c,h])}if(s)return s}return[t,e]}los(t,e,n,s){let r=Math.hypot(n-t,s-e),o=Math.max(1,Math.ceil(r/(this.cell*.45)));for(let a=0;a<=o;a++){let c=a/o;if(this.isBlocked(t+(n-t)*c,e+(s-e)*c))return!1}return!0}path(t,e,n,s){let r=this.nx,o=this.nz,a=this.blocked,[c,h]=this.nearestFree(...this.cellOf(t,e)),[l,u]=this.nearestFree(...this.cellOf(n,s)),d=h*r+c,f=u*r+l,p=r*o,x=new Float32Array(p).fill(1/0),g=new Float32Array(p).fill(1/0),m=new Int32Array(p).fill(-1),w=new Uint8Array(p),E=[],S=D=>{E.push(D);let W=E.length-1;for(;W>0;){let Z=W-1>>1;if(g[E[Z]]<=g[E[W]])break;[E[Z],E[W]]=[E[W],E[Z]],W=Z}},V=()=>{let D=E[0],W=E.pop();if(E.length){E[0]=W;let Z=0;for(;;){let J=Z*2+1,rt=J+1,K=Z;if(J<E.length&&g[E[J]]<g[E[K]]&&(K=J),rt<E.length&&g[E[rt]]<g[E[K]]&&(K=rt),K===Z)break;[E[K],E[Z]]=[E[Z],E[K]],Z=K}}return D},O=D=>{let W=Math.abs(D%r-l),Z=Math.abs((D/r|0)-u);return W+Z+(1.4142-2)*Math.min(W,Z)};x[d]=0,g[d]=O(d),S(d);let y=!1;for(;E.length;){let D=V();if(w[D])continue;if(w[D]=1,D===f){y=!0;break}let W=D%r,Z=D/r|0;for(let J=-1;J<=1;J++)for(let rt=-1;rt<=1;rt++){if(!rt&&!J)continue;let K=W+rt,ct=Z+J;if(K<0||ct<0||K>=r||ct>=o)continue;let tt=ct*r+K;if(a[tt]||w[tt]||rt&&J&&(a[Z*r+K]||a[ct*r+W]))continue;let et=x[D]+(rt&&J?1.4142:1);et<x[tt]&&(x[tt]=et,g[tt]=et+O(tt),m[tt]=D,S(tt))}}let R=[];if(y){for(let D=f;D!==-1;D=m[D])R.push({x:this.x0+(D%r+.5)*this.cell,z:this.z0+((D/r|0)+.5)*this.cell});R.reverse()}R.unshift({x:t,z:e}),R.push({x:n,z:s});let A=[R[0]],b=0;for(;b<R.length-1;){let D=R.length-1;for(;D>b+1&&!(b===0||D===R.length-1?this.losLoose(R[b],R[D]):this.los(R[b].x,R[b].z,R[D].x,R[D].z));D--);A.push(R[D]),b=D}return A}smooth(t){let e=t;for(let n=0;n<2&&!(e.length<3);n++){let s=[e[0]];for(let r=1;r<e.length-1;r++){let o=e[r-1],a=e[r],c=e[r+1],h=Math.hypot(o.x-a.x,o.z-a.z),l=Math.hypot(c.x-a.x,c.z-a.z),u=Math.min(h*.3,n?.3:.7)/(h||1),d=Math.min(l*.3,n?.3:.7)/(l||1),f={x:a.x+(o.x-a.x)*u,z:a.z+(o.z-a.z)*u},p={x:a.x+(c.x-a.x)*d,z:a.z+(c.z-a.z)*d};h>.3&&l>.3&&this.los(f.x,f.z,p.x,p.z)?s.push(f,p):s.push(a)}s.push(e[e.length-1]),e=s}return e}losLoose(t,e){let n=Math.hypot(e.x-t.x,e.z-t.z);if(n<.5)return!0;let s=Math.ceil(n/(this.cell*.45));for(let r=0;r<=s;r++){let o=r/s,a=o*n;if(!(a<.45||n-a<.45)&&this.isBlocked(t.x+(e.x-t.x)*o,t.z+(e.z-t.z)*o))return!1}return!0}};var nf={walk:["walk_neutral"],idle:["idle_neutral_01","idle_neutral_02","idle_look_around_01","idle_waiting_01"],talk:["gestic_talk_neutral_01","gestic_talk_neutral_02","gestic_talk_relaxed_01","gestic_talk_relaxed_02","gestic_talk_excited_01","moderate_01"],listen:["gestic_listen_neutral_01","gestic_listen_neutral_02","gestic_listen_accept_01","gestic_listen_accept_03","gestic_listen_relaxed_01","gestic_thoughtful_01"],present:["gestic_presentation_left_01","gestic_presentation_right_01"],phone:["cell_phone_talk_01"],text:["cell_phone_textmessage"],docs:["documents_check","documents_note"],drink:["drink_drinking","drink_idle"],workStand:["work_table"],workMid:["work_mid"],wave:["wave_01"],laugh:["gestic_laugh_low"],stretch:["idle_stretch_arms_01"],cheer:["cheer_01","cheer_03"],sitWork:["sit_table_idle_neutral_02"],sitIdle:["sit_table_idle_neutral_01","sit_table_idle_look_around","sit_table_gestic_thoughtful","sit_table_idle_relaxed_01"],sitChair:["sit_chair_idle_neutral_01","sit_chair_idle_relaxed_01","sit_chair_idle_look_around"],sitDown:["sit_down_chair_01"],standUp:["sit_stand_up_chair_01"]};var Ze=()=>new I,za=()=>new ke,Ci=Ze(),$s=Ze(),sf=Ze(),zh=Ze(),Fa=Ze(),Cv=Ze(),Pv=Ze(),Iv=Ze(),Dv=Ze(),Lv=Ze(),wn=Ze(),Oa=Ze(),Qe=za(),Ji=za(),ci=za(),Pi=za(),Uv=new I(0,1,0),Nv=new I(0,0,1),rf=new Yt,re=(i,t)=>i+Math.random()*(t-i),Dn=i=>i[Math.random()*i.length|0],Js=i=>{for(;i>Math.PI;)i-=Math.PI*2;for(;i<-Math.PI;)i+=Math.PI*2;return i},Bh=(i,t=Ze())=>t.set(Math.sin(i),0,Math.cos(i)),Xr=i=>i*i*(3-2*i),Fv=()=>{let i=new Date;return String(i.getHours()).padStart(2,"0")+":"+String(i.getMinutes()).padStart(2,"0")},Hh=class{constructor(t,e,n){this.sim=t,this.def=e,this.id=e.id,this.g=e.gender,this.av=n,this.rig=n.rig,this.mixer=new sa(n.rig),this.pos=Ze(),this.yaw=0,this.yOff=0,this.state="idle",this.queue=[],this.step=null,this.seat=null,this.home=null,this.cur=null,this.curRole=null,this.curName=null,this.fading=[],this.walkSpeed=(this.g==="f"?1.22:1.32)*re(.92,1.04),this.look=null,this.lookYaw=0,this.lookPitch=0,this.speaking=!1,this.jaw=0,this.jawT=Math.random()*10,this.blinkAt=re(1,5),this.blink=0,this.status={icon:"\u{1F4BC}",text:"No posto"},this.log=[],this.nextPlan=re(4,30),this.cleanup=[],this.props={},this.conv=null,this.expecting=null,this.busyWith=null,this.velocity=Ze(),this.moving=!1;let s=n.bones;this.bHead=s.get("Bip01_Head"),this.bNeck=s.get("Bip01_Neck"),this.bJaw=s.get("Bip01_MJaw"),this.bRH=s.get("Bip01_R_Hand"),this.bLH=s.get("Bip01_L_Hand"),this.bSpine=s.get("Bip01_Spine1")||s.get("Bip01_Spine"),this.arm={R:[s.get("Bip01_R_UpperArm"),s.get("Bip01_R_Forearm"),this.bRH],L:[s.get("Bip01_L_UpperArm"),s.get("Bip01_L_Forearm"),this.bLH]},this.wL=0,this.wR=0,this.wM=0,this.handMode="rest",this.handT=re(.5,3),this.kbT=null,this.mouseT=null,this.workLookT=0,this.lookWork=null,this.fing={L:[],R:[]};for(let r of["L","R"])for(let o of["0","1","2","3","4"]){let a=Math.random()*10,c=3+Math.random()*4;["","1","2"].forEach((h,l)=>{let u=`Bip01_${r}_Finger${o}${h}`,d=s.get(u),f=n.rest.get(u);d&&f&&this.fing[r].push({bone:d,rest:f.q,seg:l,thumb:o==="0",ph:a,rate:c})})}this.lids=["Bip01_LEyeBlinkTop","Bip01_REyeBlinkTop"].map(r=>s.get(r)).filter(Boolean),this.lidRest=this.lids.map(r=>r.position.clone()),this.jawRest=this.bJaw?this.bJaw.quaternion.clone():null,this.headPos=Ze()}say(t,e,n=!0){this.status={icon:t,text:e},n&&(this.log.push({t:Fv(),text:e}),this.log.length>40&&this.log.shift()),this.sim.onStatus&&this.sim.onStatus(this),n&&this.sim.onSay&&this.sim.onSay(this,t,e)}clip(t,e){return this.sim.clip(this.g,t,e)}play(t,{fade:e=.4,name:n=null,timeScale:s=1,force:r=!1}={}){let o=nf[t]||[t],a=n||Dn(o);if(!r&&this.curRole===t&&o.length>1)for(let u=0;u<4&&a===this.curName;u++)a=Dn(o);let c=t==="walk",h=this.clip(a,{inplace:t==="walk"||t==="sitDown"||t==="standUp"});if(this.cur&&this.cur.getClip()===h){if(c)return this.cur.timeScale=s,this.cur;h=this.sim.twin(h)}let l=this.mixer.clipAction(h);return l.reset(),l.enabled=!0,l.setEffectiveWeight(1),l.timeScale=s,l.setLoop(c?eh:la,1/0),l.clampWhenFinished=!0,l.play(),this.cur&&this.cur!==l&&(e>0?(this.cur.crossFadeTo(l,e,!1),this.fading.push([this.cur,e+.05])):this.cur.stop()),this.cur=l,this.curRole=t,this.curName=a,l}enqueue(...t){this.queue.push(...t.flat().filter(Boolean))}get busy(){return!!this.step||this.queue.length>0}finish(){this.step=null}runCleanup(){let t=this.cleanup;this.cleanup=[];for(let e of t)try{e()}catch(n){console.error(n)}}interrupt(){this.queue.length=0,this.step&&(this.step.t==="act"||this.step.t==="hold"||this.step.t==="wait")?this.step=null:this.step&&this.step.t==="walk"&&(this.step=null,this.moving=!1),this.runCleanup(),this.conv=null,this.speaking=!1,this.look=null,this.setProp(null)}update(t,e){if(!this.step&&this.queue.length&&(this.step=this.queue.shift(),this.step.ph=0,this.step.time=0,this.begin(this.step)),this.step?(this.step.time+=t,this.run(this.step,t,e)):this.idleTick(t,e),this.cur&&this.cur.loop===la&&this.curRole!=="sitDown"&&this.curRole!=="standUp"){let n=this.cur.getClip();if(this.cur.time>n.duration-.5){let s=this.curRole;this.state==="seated"&&!this.step&&!this.conv&&this.seat&&this.seat.kind==="desk"&&(s=Math.random()<.74?"sitWork":"sitIdle"),this.play(s,{fade:.5})}}for(let n=this.fading.length-1;n>=0;n--)if(this.fading[n][1]-=t,this.fading[n][1]<=0){let s=this.fading[n][0];s!==this.cur&&s.stop(),this.fading.splice(n,1)}this.mixer.update(t),this.rig.position.set(this.pos.x,this.pos.y+this.yOff,this.pos.z),this.rig.rotation.y=this.yaw,this.post(t,e)}idleTick(t,e){this.state==="seated"?(this.curRole!=="sitWork"&&this.curRole!=="sitIdle"&&this.curRole!=="sitChair"&&this.play(this.seat&&this.seat.kind==="desk"?"sitWork":"sitChair"),this.conv||this.swivelTo(0,t)):this.curRole!=="idle"&&this.play("idle")}swivelTo(t,e){let n=this.seat;if(!n)return;let s=n.swivel||0,r=s+(t-s)*(1-Math.exp(-e*3));n.swivel=r,this.yaw=n.yaw+r,this.sim.world.placeChair(n)}begin(t){if(t.t==="walk"){if(this.state==="seated"){this.queue.unshift({t:"stand"},t),this.step=null;return}let e=typeof t.to=="function"?t.to():t.to;t.dest=e,t.path=this.sim.nav.smooth(this.sim.nav.path(this.pos.x,this.pos.z,e.x,e.z)),t.i=1,t.ph=0,this.state="walking",t.label&&this.say(t.icon||"\u{1F6B6}",t.label)}else if(t.t==="sit"){let e=t.seat;t.f=Bh(e.yaw),t.ph=0,this.state="transition",this.seat=e,this.yaw=e.yaw,t.from=e.rolled,t.sw0=e.swivel||0,e.free=!1}else if(t.t==="stand"){if(this.state!=="seated"){this.step=null;return}let e=this.seat;t.f=Bh(e.yaw),t.ph=0,this.state="transition",t.sw=e.swivel||0}else t.t==="act"?((t.icon||t.label)&&this.say(t.icon||"\u{1F4AC}",t.label||""),t.role&&this.play(t.role,{name:t.clip}),t.prop!==void 0&&this.setProp(t.prop),this.speaking=!!t.speaking,t.look!==void 0&&(this.look=t.look),t.dur=t.dur||8,this.state!=="seated"&&(this.state="acting")):t.t==="fn"?(t.fn(this),this.step=null):t.t==="face"&&(t.target=t.yaw!==void 0?t.yaw:null)}run(t,e,n){let s=this.sim.world;if(t.t==="walk")return this.runWalk(t,e);if(t.t==="face"){let r=t.target!==null?t.target:Math.atan2(t.toward().x-this.pos.x,t.toward().z-this.pos.z);this.turn(r,e,4.5)&&this.finish(),this.curRole!=="idle"&&this.state!=="seated"&&this.play("idle");return}if(t.t==="wait"){t.time>=t.dur&&this.finish(),this.state!=="seated"&&this.curRole!=="idle"&&this.play("idle");return}if(t.t==="hold"){t.until(this,t)||t.time>(t.max||120)?(t.done&&t.done(this),this.finish()):t.tick&&t.tick(this,t,e);return}if(t.t==="act"){t.tick&&t.tick(this,t,e),t.time>=t.dur&&(t.end&&t.end(this),this.speaking=!1,t.prop&&this.setProp(null),this.finish());return}if(t.t==="sit"){let r=t.seat,o=t.f;if(t.ph===0){let a=Math.min(1,t.time/.45);r.rolled=t.from+(1-t.from)*Xr(a),r.swivel=t.sw0*(1-Xr(a)),s.placeChair(r);let c=r.pos.x-o.x*(r.rollBack-this.sitLen()),h=r.pos.z-o.z*(r.rollBack-this.sitLen());this.pos.x+=(c-this.pos.x)*Math.min(1,e*8),this.pos.z+=(h-this.pos.z)*Math.min(1,e*8),this.turn(r.yaw,e,6),a>=1&&(t.ph=1,t.start=this.pos.clone().set(c,0,h),this.pos.copy(t.start),this.yaw=r.yaw,t.act=this.play("sitDown",{fade:.25}),t.len=this.sitLen())}else if(t.ph===1){let a=t.act.getClip(),c=Math.min(1,t.act.time/a.duration);this.pos.x=t.start.x-o.x*t.len*c,this.pos.z=t.start.z-o.z*t.len*c,t.act.time>=a.duration-.02&&(t.ph=2,t.time=0,this.pos.set(r.pos.x-o.x*r.rollBack,0,r.pos.z-o.z*r.rollBack),this.play(r.kind==="desk"?"sitIdle":"sitChair",{fade:.35,name:r.kind==="desk"?"sit_table_idle_neutral_01":"sit_chair_idle_neutral_01"}))}else{let a=Math.min(1,t.time/.9);r.rolled=1-Xr(a),this.pos.set(r.pos.x-o.x*r.rollBack*r.rolled,0,r.pos.z-o.z*r.rollBack*r.rolled),s.placeChair(r),a>=1&&(this.state="seated",this.yOff=this.g==="f"?-.02:0,this.finish())}return}if(t.t==="stand"){let r=this.seat,o=t.f;if(t.ph===0){let a=Math.min(1,t.time/.75);r.rolled=Xr(a),r.swivel=t.sw*(1-Xr(a)),this.yaw=r.yaw+r.swivel,this.pos.set(r.pos.x-o.x*r.rollBack*r.rolled,0,r.pos.z-o.z*r.rollBack*r.rolled),s.placeChair(r),a>=1&&(t.ph=1,t.start=this.pos.clone(),this.yaw=r.yaw,t.act=this.play("standUp",{fade:.25}),t.len=Math.abs(t.act.getClip().userData.drift[2])*.01,this.yOff=0)}else{let a=t.act.getClip(),c=Math.min(1,t.act.time/a.duration);this.pos.x=t.start.x+o.x*t.len*c,this.pos.z=t.start.z+o.z*t.len*c,t.act.time>=a.duration-.02&&(this.state="idle",r.kind!=="desk"&&(r.by=null),r.free=!0,r.rest=re(-.34,.34),this.seat=null,this.play("idle",{fade:.3}),this.finish())}return}}sitLen(){return Math.abs(this.clip("sit_down_chair_01",{inplace:!0}).userData.drift[2])*.01}standPoint(t){let e=Bh(t.yaw),n=t.rollBack-this.sitLen();return{x:t.pos.x-e.x*n,z:t.pos.z-e.z*n}}turn(t,e,n=5){let s=Js(t-this.yaw),r=n*e;return Math.abs(s)<=r?(this.yaw=t,!0):(this.yaw+=Math.sign(s)*r,!1)}runWalk(t,e){let n=t.path[t.i];if(!n){this.arrive(t,e);return}let s=n.x-this.pos.x,r=n.z-this.pos.z,o=Math.hypot(s,r),a=Math.atan2(s,r);if(t.ph===0){if(Math.abs(Js(a-this.yaw))>1&&o>.2){this.curRole!=="idle"&&this.play("idle",{fade:.25}),this.turn(a,e,5.5);return}t.ph=1,this.play("walk",{fade:.3,timeScale:this.walkSpeed/this.clip("walk_neutral",{inplace:!0}).userData.speed})}let c=this.walkSpeed,h=o+this.remain(t),l=0,u=1;for(let f of this.sim.agents){if(f===this)continue;let p=f.pos.x-this.pos.x,x=f.pos.z-this.pos.z,g=Math.hypot(p,x);if(g>1.25||g<.001||(p*s+x*r)/(g*(o||1))<.25)continue;let w=(s*x-r*p)/(g*(o||1));l+=(w>0?-1:1)*(1.25-g)*(f.state==="walking"?.9:1.4),g<.55&&(u=Math.min(u,.35))}h<.5&&(c*=Math.max(.45,h/.5)),c*=u;let d=Math.min(o,c*e);if(o>1e-4){let f=this.pos.x+s/o*d,p=this.pos.z+r/o*d;if(l&&h>.9){let x=r/o,g=-s/o,m=f+x*l*e*.9,w=p+g*l*e*.9;this.sim.nav.isBlocked(m,w)||(f=m,p=w)}this.pos.x=f,this.pos.z=p}this.yaw+=Js(a-this.yaw)*Math.min(1,e*7.5),this.cur&&this.curRole==="walk"&&(this.cur.timeScale=Math.max(.5,c/this.clip("walk_neutral",{inplace:!0}).userData.speed)),o<(t.i<t.path.length-1?.16:.06)&&t.i++,this.moving=!0}remain(t){let e=0;for(let n=t.i;n<t.path.length-1;n++)e+=Math.hypot(t.path[n+1].x-t.path[n].x,t.path[n+1].z-t.path[n].z);return e}arrive(t,e){this.moving=!1,this.curRole==="walk"&&this.play("idle",{fade:.3});let n=t.yaw!==void 0?typeof t.yaw=="function"?t.yaw():t.yaw:null;n!==null&&!this.turn(n,e,5)||(this.state="idle",this.finish())}setProp(t){if(this.props.cur===t||(this.props.obj&&(this.props.obj.parent&&this.props.obj.parent.remove(this.props.obj),this.props.obj=null),this.props.cur=t,!t))return;let e=this.sim.propCfg[t];if(!e)return;let n=e.make(),s=e.hand==="L"?this.bLH:this.bRH;n.scale.setScalar(100),n.position.fromArray(e.pos),n.rotation.fromArray(e.rot),s.add(n),this.props.obj=n}ik(t,e,n){let[s,r,o]=this.arm[t];if(!s||!r||!o)return;let a=s.getWorldPosition(sf),c=r.getWorldPosition(zh),h=o.getWorldPosition(Fa),l=a.distanceTo(c),u=c.distanceTo(h),d=Pv.copy(e).sub(a),f=d.length(),p=(l+u)*.985;f>p&&(d.multiplyScalar(p/f),f=p);let x=Lv.copy(d).normalize(),g=Bn.clamp((l*l+f*f-u*u)/(2*l*f),-1,1),m=Math.sqrt(1-g*g),w=Iv.copy(c).sub(a);w.addScaledVector(x,-w.dot(x)),w.y-=.25,w.addScaledVector(x,-w.dot(x)),w.lengthSq()<1e-6&&w.set(0,-1,0),w.normalize();let E=Dv.copy(a).addScaledVector(x,l*g).addScaledVector(w,l*m),S=(R,A,b)=>{Qe.setFromUnitVectors(A,b),Ji.identity().slerp(Qe,n),R.getWorldQuaternion(ci),R.parent.getWorldQuaternion(Pi),Ji.multiply(ci),R.quaternion.copy(Pi.invert().multiply(Ji)),R.updateMatrixWorld(!0)};S(s,Ci.copy(c).sub(a).normalize(),$s.copy(E).sub(a).normalize());let V=r.getWorldPosition(zh),O=o.getWorldPosition(Fa),y=Cv.copy(d).add(a);S(r,Ci.copy(O).sub(V).normalize(),$s.copy(y).sub(V).normalize())}hand(t,e,n,s,r,o,a){let c=this.arm[t][2];if(!c||e<.01)return;let h=Math.cos(this.yaw),l=Math.sin(this.yaw),u=sf.set(n*h+r*l,s,-n*l+r*h).normalize(),d=zh.set(0,-1,0);d.crossVectors(u,Fa.set(0,-1,0)).normalize();let f=Fa.crossVectors(d,u);rf.makeBasis(u,f,d),Qe.setFromRotationMatrix(rf),c.getWorldQuaternion(ci),ci.slerp(Qe,e),c.parent.getWorldQuaternion(Pi),c.quaternion.copy(Pi.invert().multiply(ci));let p=this.sim.fingerAmp??.3;for(let x of this.fing[t]){let g=x.thumb?0:[.2,.34,.24][x.seg];!x.thumb&&x.seg===0&&(g+=(this.sim.fingerAmp!==void 0?1:Math.max(0,Math.sin(a*x.rate*2.4+x.ph)*Math.sin(a*1.7+x.ph*3)))*p*o),Qe.setFromAxisAngle(Nv,-g),Ji.copy(x.rest).multiply(Qe),x.bone.quaternion.slerp(Ji,e)}}post(t,e){this.rig.updateMatrixWorld(!0);let n=Math.max(this.wL,this.wR)*.115;if(n>.002&&this.bSpine){let l=this.bSpine;$s.set(Math.cos(this.yaw),0,-Math.sin(this.yaw)),Qe.setFromAxisAngle($s,n),l.getWorldQuaternion(ci),l.parent.getWorldQuaternion(Pi),Qe.multiply(ci),l.quaternion.copy(Pi.invert().multiply(Qe)),l.updateMatrixWorld(!0)}this.bHead&&this.bHead.getWorldPosition(this.headPos);let s=this.state==="seated"&&!this.step&&!this.conv&&this.curRole==="sitWork"&&this.seat&&this.seat.monitors;if(s){if(this.workLookT-=t,this.workLookT<=0){this.workLookT=re(2.5,7);let l=this.seat.monitors;this.lookWork=Math.random()<.8?l[Math.random()*l.length|0]:null}}else this.lookWork=null;let r=0,o=0,a=this.look||this.lookCam||this.lookWork,c=a?a.isVector3?a:a.headPos:null;if(c){Ci.copy(c).sub(this.headPos);let l=Math.hypot(Ci.x,Ci.z);l>.25&&(r=Bn.clamp(Js(Math.atan2(Ci.x,Ci.z)-this.yaw),-1.15,1.15),o=Bn.clamp(Math.atan2(Ci.y,l),-.5,.45))}o+=n*.8;let h=1-Math.exp(-t*5);if(this.lookYaw+=(r-this.lookYaw)*h,this.lookPitch+=(o-this.lookPitch)*h,Math.abs(this.lookYaw)>.01||Math.abs(this.lookPitch)>.01){$s.set(Math.cos(this.yaw),0,-Math.sin(this.yaw));for(let[l,u]of[[this.bNeck,.4],[this.bHead,.6]])l&&(Qe.setFromAxisAngle(Uv,this.lookYaw*u),Ji.setFromAxisAngle($s,-this.lookPitch*u),Qe.multiply(Ji),l.getWorldQuaternion(ci),l.parent.getWorldQuaternion(Pi),Qe.multiply(ci),l.quaternion.copy(Pi.invert().multiply(Qe)),l.updateMatrixWorld(!0));this.bHead&&this.bHead.getWorldPosition(this.headPos)}if(this.sim.detail){let l=s&&this.seat.kb?this.seat.kb:null;l?(this.kbT=l,this.mouseT=this.seat.mouse,this.handT-=t,this.handT<=0&&(this.handMode!=="type"?(this.handMode="type",this.handT=re(5,15)):this.mouseT&&Math.random()<.6?(this.handMode="mouse",this.handT=re(2,5.5)):(this.handMode="rest",this.handT=re(2.5,6)))):(this.handMode="rest",this.handT=re(.4,2.2));let u=l?this.handMode:"rest",d=Math.min(1,t*(l?3.2:7)),f=u==="rest"?0:1;if(this.wL+=(f-this.wL)*d,this.wR+=(f-this.wR)*d,this.wM+=((u==="mouse"?1:0)-this.wM)*Math.min(1,t*3.2),this.kbT&&this.state==="seated"&&(this.wL>.01||this.wR>.01)){let p=this.jawT,x=u==="type"?1:0;wn.copy(this.kbT[0]),wn.x+=Math.sin(e*1.3+p)*.012*x,wn.z+=Math.cos(e*1.1+p)*.012*x,wn.y+=Math.abs(Math.sin(e*6.1+p))*.006*x,this.ik("L",wn,this.wL),this.hand("L",this.wL,-.3,-.1,.95,x,e),wn.copy(this.kbT[1]),wn.x+=Math.sin(e*1.5+p*2)*.012*x,wn.z+=Math.cos(e*.9+p*2)*.012*x,wn.y+=Math.abs(Math.sin(e*5.3+p*3))*.006*x,this.mouseT&&this.wM>.001&&(Oa.copy(this.mouseT),Oa.x+=Math.sin(e*2.1+p)*.022,Oa.z+=Math.cos(e*1.6+p)*.016,wn.lerp(Oa,this.wM),wn.y+=Math.sin(this.wM*Math.PI)*.03),this.ik("R",wn,this.wR),this.hand("R",this.wR,.3*(1-this.wM),-.1,.95,x*(1-this.wM)+.25*this.wM,e)}}else this.wL=this.wR=this.wM=0;if(this.blinkAt-=t,this.blinkAt<=0&&(this.blink=.16,this.blinkAt=re(2.2,6)),this.blink>0||this._lidDirty){this.blink=Math.max(0,this.blink-t);let l=Math.sin(Math.min(1,this.blink/.16)*Math.PI),u=this.sim.blinkDelta[this.g];this.lids.forEach((d,f)=>{d.position.copy(this.lidRest[f]),u&&d.position.addScaledVector(u,l)}),this._lidDirty=this.blink>0}if(this.bJaw){let l=this.jawForce!==void 0?this.jawForce:this.speaking?(.35+.65*Math.abs(Math.sin(e*9.1+this.jawT)*Math.sin(e*5.3+this.jawT*2)))*(Math.sin(e*1.3+this.jawT)>-.6?1:.1):0;this.jaw+=(l-this.jaw)*Math.min(1,t*18);let u=this.sim.jawCfg;Qe.setFromAxisAngle(u.axis,u.max*this.jaw),this.bJaw.quaternion.copy(this.jawRest).multiply(Qe)}}},ka=class{constructor({world:t,nav:e,pack:n,config:s}){this.world=t,this.nav=e,this.pack=n,this.config=s,this.agents=[],this.byId=new Map,this.twins=new Map,this.detail=!0,this.time=0,this.meeting=null,this.nextMeeting=re(170,260),this.paused=!1,this.blinkDelta={};for(let r of["m","f"])try{let o=n.json(`an/${r}_idle_neutral_01/meta.json`).face.Bip01_LEyeBlinkTop;o&&o.d>.3&&(this.blinkDelta[r]=new I(o.far[0]-o.rest[0],o.far[1]-o.rest[1],o.far[2]-o.rest[2]))}catch{}this.jawCfg={axis:new I(0,0,1),max:.13},this.propCfg={phone:{hand:"R",pos:[8.6,0,-2.4],rot:[0,Math.PI/2,0],make:()=>Q(.07,.008,.145,G.black(),0,0,0,{r:.003})},cup:{hand:"R",pos:[8,0,3.5],rot:[Math.PI/2,0,0],make:()=>{let r=new ie;return r.add(Lt(.036,.03,.085,G.color(16777215,.4),0,0,0,14)),r}}}}clip(t,e,n){let s=this.pack.has(`an/${t}_${e}/meta.json`)?`${t}_${e}`:`m_${e}`;return Wd(this.pack,s,n)}twin(t){if(!this.twins.has(t.uuid)){let e=t.clone();e.userData=t.userData,e.name=t.name+"#2",this.twins.set(t.uuid,e),this.twins.set(e.uuid,t)}return this.twins.get(t.uuid)}add(t,e){let n=new Hh(this,t,e);this.agents.push(n),this.byId.set(n.id,n);let s=this.world.seats.get(t.seat);return n.home=s,s&&(s.by=n,s.owner=n,n.seat=s,n.state="seated",s.rolled=0,s.free=!1,s.swivel=0,this.world.placeChair(s),n.pos.copy(s.pos),n.yaw=s.yaw,n.yOff=n.g==="f"?-.02:0,n.play("sitWork",{fade:0}),n.cur.time=Math.random()*6),n.say("\u{1F4BC}",t.workLabel||"Trabalhando no posto",!1),n}goHome(t){let e=t.home;return[{t:"walk",to:()=>t.standPoint(e),yaw:e.yaw,label:"Voltando ao posto",icon:"\u{1F6B6}"},{t:"sit",seat:e},{t:"fn",fn:()=>{t.say("\u{1F4BC}",t.def.workLabel||"Trabalhando no posto"),t.nextPlan=this.time+re(18,50)}}]}reserve(t,e){e.by=t,t.cleanup.push(()=>{e.by===t&&(e.by=null)})}freeSpot(t){let e=t.map(n=>this.world.spots.get(n)).filter(n=>n&&!n.by);return e.length?Dn(e):null}visitorPoint(t,e){let n=t.home,s=(n.visitor||[]).filter(r=>!this.agents.some(o=>o!==e&&Math.hypot(o.pos.x-r[0],o.pos.z-r[1])<.6)&&!(n._res||[]).includes(r));return s.length?Dn(s):null}visit(t,e,{dur:n=re(13,22),then:s=null,topic:r=null}={}){if(!e||e===t||e.state!=="seated"||e.seat!==e.home||e.busy||e.expecting||e.conv)return!1;let o=this.visitorPoint(e,t);if(!o)return!1;e.expecting=t,e.nextPlan=Math.max(e.nextPlan,this.time+60),t.cleanup.push(()=>{e.expecting===t&&(e.expecting=null),e.conv&&e.conv.with===t&&this.endConv(e)});let a=e.def.kind==="president"?"Indo falar com o Presidente":`Indo falar com ${e.def.name}`;return t.enqueue({t:"walk",to:{x:o[0],z:o[1]},yaw:()=>Math.atan2(e.pos.x-o[0],e.pos.z-o[1]),label:a,icon:"\u{1F6B6}"},{t:"fn",fn:()=>{if(e.state!=="seated"||e.busy){t.interrupt(),t.enqueue(this.goHome(t));return}this.beginConv(t,e,r)}},{t:"act",dur:n,tick:(c,h,l)=>this.convTick(t,e,h,l),end:()=>{this.endConv(t),this.endConv(e),e.expecting=null,e.nextPlan=this.time+re(8,25)}},s||this.goHome(t)),!0}beginConv(t,e,n){t.conv={with:e,speaker:t,next:this.time+re(3,5.5)},e.conv={with:t,speaker:t},t.look=e,e.look=t,t.speaking=!0,e.speaking=!1,t.play("talk"),e.state==="seated"?e.play("sitIdle",{name:"sit_table_idle_neutral_01"}):e.play("listen"),t.say("\u{1F4AC}",n||`Conversando com ${e.def.name}`),e.say("\u{1F4AC}",`Conversando com ${t.def.name}`)}convTick(t,e,n,s){let r=t.conv;if(!r||!e.conv||e.conv.with!==t){n.time=n.dur;return}if(e.state==="seated"){let o=Bn.clamp(Js(Math.atan2(t.pos.x-e.pos.x,t.pos.z-e.pos.z)-e.seat.yaw),-1.25,1.25);e.swivelTo(o,s)}else e.yaw+=Js(Math.atan2(t.pos.x-e.pos.x,t.pos.z-e.pos.z)-e.yaw)*Math.min(1,s*4);if(this.time>r.next){r.speaker=r.speaker===t?e:t,r.next=this.time+re(2.8,6);let o=r.speaker,a=o===t?e:t;o.speaking=!0,a.speaking=!1,o.state!=="seated"&&o.play("talk"),a.state!=="seated"?a.play("listen"):a.play("sitIdle",{name:Dn(["sit_table_idle_neutral_01","sit_table_gestic_thoughtful","sit_table_idle_relaxed_01"])})}}endConv(t){t&&(t.conv=null,t.speaking=!1,t.look=null,t.state==="seated"&&!t.busy&&t.say("\u{1F4BC}",t.def.workLabel||"Trabalhando no posto",!1))}chat(t,e,n,s,r=re(12,20)){if(!n||!s||e.busy||e.expecting||e.conv||e.state!=="seated")return!1;this.reserve(t,n),this.reserve(e,s),e.nextPlan=this.time+90;let o={arrived:0},a=(c,h,l,u)=>{c.enqueue({t:"walk",to:{x:l.pos.x,z:l.pos.z},yaw:l.yaw,label:`Indo encontrar ${h.def.name}`,icon:"\u{1F6B6}"},{t:"fn",fn:()=>{o.arrived++,c.look=h}},{t:"hold",until:()=>o.arrived>=2,max:30,tick:d=>{d.curRole!=="idle"&&d.play("idle")}},u?[{t:"fn",fn:()=>this.beginConv(t,e)},{t:"act",dur:r,tick:(d,f,p)=>this.convTick(t,e,f,p),end:()=>{this.endConv(t),this.endConv(e),o.done=!0}}]:{t:"hold",until:()=>o.done,max:r+40},{t:"fn",fn:()=>c.runCleanup()},this.goHome(c))};return a(t,e,n,!0),a(e,t,s,!1),!0}errand(t,e){let n=this.world.spots.get(e.spot);return!n||n.by?!1:(this.reserve(t,n),t.enqueue({t:"walk",to:{x:n.pos.x,z:n.pos.z},yaw:n.yaw,label:e.go||"A caminho",icon:"\u{1F6B6}"},{t:"act",role:e.role,clip:e.clip,dur:re(e.dur[0],e.dur[1]),label:e.label,icon:e.icon,prop:e.prop,speaking:!!e.speaking},{t:"fn",fn:()=>t.runCleanup()},this.goHome(t)),!0)}coffee(t){let n=this.world.spots.get("copa.machine"),s=this.freeSpot(["copa.t1","copa.t2","copa.t3","copa.water"]);if(!s||n.by)return!1;this.reserve(t,s),this.reserve(t,n);let r=()=>this.agents.filter(o=>o!==t&&o.state==="acting"&&Math.hypot(o.pos.x-t.pos.x,o.pos.z-t.pos.z)<2.2);return t.enqueue({t:"walk",to:{x:n.pos.x+re(-.15,.15),z:n.pos.z+re(-.1,.1)},yaw:n.yaw,label:"Indo tomar um caf\xE9",icon:"\u2615"},{t:"act",role:"workStand",dur:re(4.5,6.5),label:"Preparando o caf\xE9",icon:"\u2615"},{t:"fn",fn:()=>{n.by===t&&(n.by=null),t.setProp("cup")}},{t:"walk",to:{x:s.pos.x,z:s.pos.z},yaw:s.yaw},{t:"act",role:"drink",dur:re(14,24),label:"Pausa para o caf\xE9",icon:"\u2615",prop:"cup",tick:(o,a)=>{let c=r();o.look=c.length?c[0]:null,o.speaking=c.length>0&&Math.sin(this.time*.5+o.jawT)>.2}},{t:"fn",fn:()=>{t.look=null,t.speaking=!1,t.setProp(null),t.runCleanup()}},this.goHome(t)),!0}startMeeting(t=null){if(this.meeting)return!1;let e=this.world,n=[...e.seats.values()].filter(h=>h.kind==="meeting"),s=this.byId.get("thiago"),r=t?t.map(h=>this.byId.get(h)).filter(Boolean):this.agents.filter(h=>h.def.kind!=="reception"&&h!==s);r=r.filter(h=>h.def.kind!=="reception"&&h!==s).sort(()=>Math.random()-.5).slice(0,n.length);let o={people:[],seated:0,start:null,dur:re(36,52),presenter:s,over:!1};this.meeting=o;let a=e.spots.get("reuniao.present"),c=h=>{h.look=null,h.speaking=!1};return s.interrupt(),s.enqueue({t:"walk",to:{x:a.pos.x,z:a.pos.z},yaw:a.yaw,label:"Indo para a reuni\xE3o geral",icon:"\u{1F4E3}"},{t:"fn",fn:()=>{o.presenterIn=!0}},{t:"hold",until:()=>o.seated>=Math.max(1,o.people.length-1)||o.over,max:45,tick:h=>{h.curRole!=="idle"&&h.play("idle")}},{t:"fn",fn:()=>{o.start=this.time,s.say("\u{1F4E3}","Conduzindo a reuni\xE3o geral")}},{t:"act",role:"present",dur:o.dur,speaking:!0,tick:(h,l)=>{h.speaking=Math.sin(this.time*.35)>-.75}},{t:"fn",fn:()=>{o.over=!0,c(s),this.meeting=null,this.nextMeeting=this.time+re(300,460)}},this.goHome(s)),r.forEach((h,l)=>{let u=n[l];!u||u.by||(h.interrupt(),u.by=h,o.people.push(h),h.cleanup.push(()=>{u.by===h&&h.seat!==u&&(u.by=null)}),h.enqueue({t:"wait",dur:re(0,3.5)},{t:"walk",to:()=>h.standPoint(u),yaw:u.yaw,label:"Indo para a reuni\xE3o geral",icon:"\u{1F4E3}"},{t:"sit",seat:u},{t:"fn",fn:()=>{o.seated++,h.look=s,h.say("\u{1F4E3}","Na reuni\xE3o geral")}},{t:"hold",until:()=>o.over,max:140,tick:d=>{d.curRole!=="sitChair"&&d.curRole!=="sitIdle"&&d.play("sitChair")}},{t:"fn",fn:()=>c(h)},{t:"wait",dur:re(0,2.5)},{t:"stand"},this.goHome(h)))}),!0}celebrate(t,e="Comemorando o novo pedido"){return!t||t.busy||t.conv||t.expecting||t.state==="transition"||t.state==="seated"&&t.seat!==t.home?!1:(t.enqueue(t.state==="seated"?{t:"stand"}:null,{t:"act",role:"cheer",dur:re(3.6,4.6),label:e,icon:"\u{1F389}"},this.goHome(t)),!0)}allHome(){this.meeting=null;for(let t of this.agents)t.state==="seated"&&t.seat===t.home&&!t.busy||(t.interrupt(),t.state==="seated"&&t.seat!==t.home&&t.enqueue({t:"stand"}),t.enqueue(this.goHome(t)))}command(t,e){let n=this.byId.get("thiago");if(e==="home"){if(t.interrupt(),t.state==="seated"&&t.seat===t.home)return;t.state==="seated"&&t.enqueue({t:"stand"}),t.enqueue(this.goHome(t))}else if(e==="coffee")t.interrupt(),this.coffee(t)||(t.say("\u23F3","Copa ocupada \u2014 tenta de novo em instantes",!1),t.state==="seated"&&t.seat===t.home||t.enqueue(this.goHome(t)));else if(e==="president"&&t!==n)t.interrupt(),this.visit(t,n,{dur:re(16,24),topic:"Reportando ao Presidente"})||(t.say("\u23F3","Presidente ocupado \u2014 tenta de novo em instantes"),t.state!=="seated"&&t.enqueue(this.goHome(t)));else if(e==="visit"&&t===n){t.interrupt();let s=this.agents.filter(r=>r.def.kind==="head"||r.def.kind==="chief");for(let r of s.sort(()=>Math.random()-.5))if(this.visit(t,r,{topic:`Passando no setor: ${r.def.dept}`}))return;t.enqueue(this.goHome(t))}else e==="phone"&&(t.interrupt(),!this.phone(t)&&!(t.state==="seated"&&t.seat===t.home)&&t.enqueue(this.goHome(t)))}phone(t){let e=this.world,n=t.def.kind==="president"?e.spots.get("pres.window"):null;if(!n||n.by){let s=this.freePoint(t.home.room,t.home.pos,1.3,3.6,t);if(!s)return!1;n={pos:new I(s.x,0,s.z),yaw:Math.atan2(t.home.pos.x-s.x,t.home.pos.z-s.z)+Math.PI+re(-.9,.9),by:null}}else this.reserve(t,n);return t.enqueue({t:"walk",to:{x:n.pos.x,z:n.pos.z},yaw:n.yaw,label:"Atendendo o telefone",icon:"\u{1F4DE}"},{t:"act",role:"phone",dur:re(11,18),label:"Em liga\xE7\xE3o",icon:"\u{1F4DE}",prop:"phone",speaking:!0,tick:s=>{s.speaking=Math.sin(this.time*.7+s.jawT)>-.2}},{t:"fn",fn:()=>t.runCleanup()},this.goHome(t)),!0}freePoint(t,e,n,s,r){let o=this.world.rooms[t];if(!o)return null;let a=this.nav;for(let c=0;c<60;c++){let h=re(o.x1+.7,o.x2-.7),l=re(o.z1+.7,o.z2-.7),u=Math.hypot(h-e.x,l-e.z);if(u<n||u>s)continue;let d=!0;for(let[f,p]of[[0,0],[.35,0],[-.35,0],[0,.35],[0,-.35]])if(a.isBlocked(h+f,l+p)){d=!1;break}if(d&&!this.agents.some(f=>f!==r&&Math.hypot(f.pos.x-h,f.pos.z-l)<.9)&&![...this.world.spots.values()].some(f=>Math.hypot(f.pos.x-h,f.pos.z-l)<.6)&&![...this.world.seats.values()].some(f=>Math.hypot(f.pos.x-h,f.pos.z-l)<1||(f.visitor||[]).some(p=>Math.hypot(p[0]-h,p[1]-l)<.7)))return{x:h,z:l}}return null}sameRoom(t,e){let n=this.world.rooms[t.room];return n&&e.x>n.x1+.4&&e.x<n.x2-.4&&e.z>n.z1+.4&&e.z<n.z2-.4}plan(t){let e=t.def.kind,n=Math.random(),s=this.byId.get("thiago"),r=this.byId.get("hermes"),o=this.agents.filter(d=>d.def.kind==="head"),a=this.agents.filter(d=>d!==t&&d.home.room===t.home.room);if(this.agents.filter(d=>d.state!=="seated"||d.busy).length>=Math.ceil(this.agents.length*.6))return!1;let h=t.def.errands||[],l=d=>{for(let f of d)if(f())return!0;return!1},u=()=>h.length?this.errand(t,Dn(h)):!1;if(e==="president")return n<.34?l([()=>this.visit(t,Dn([...o,r]),{topic:"Passando nos setores"}),()=>this.phone(t)]):n<.58?this.phone(t):n<.74?this.coffee(t):n<.86?u():!1;if(e==="chief")return n<.3?l([()=>this.visit(t,s,{topic:"Alinhando prioridades com o Presidente"}),u]):n<.6?l([()=>this.visit(t,Dn(o)),u]):n<.8?u():n<.93?this.coffee(t):this.phone(t);if(e==="head"){if(n<.36)return u();if(n<.5)return l([()=>this.visit(t,Dn([...o,r].filter(x=>x!==t))),u]);if(n<.6)return l([()=>this.visit(t,s,{topic:"Reportando ao Presidente"}),u]);if(n<.78)return this.coffee(t);if(n<.9)return this.phone(t);let d=Dn(o.filter(x=>x!==t)),f=this.world.spots,p=!f.get("cor.a1").by&&!f.get("cor.a2").by?["cor.a1","cor.a2"]:!f.get("cor.b1").by&&!f.get("cor.b2").by?["cor.b1","cor.b2"]:null;return p&&this.chat(t,d,f.get(p[0]),f.get(p[1]))||u()}return e==="staff"?n<.3?l([()=>this.visit(t,Dn(a)),u]):n<.58?u():n<.8?this.coffee(t):this.phone(t):e==="reception"?n<.35?this.coffee(t):n<.7?u():!1:!1}update(t){if(this.paused)return;this.time+=t;let e=this.time;for(let n of this.agents){if(!n.busy&&n.state==="seated"&&n.seat===n.home&&!n.expecting&&!n.conv&&e>n.nextPlan){let s=this.plan(n);n.nextPlan=e+(s?30:re(6,16))}!n.busy&&n.state==="seated"&&n.seat!==n.home&&(n.runCleanup(),n.enqueue({t:"stand"},this.goHome(n))),!n.busy&&n.state!=="seated"&&n.state!=="transition"?(n.idleFor=(n.idleFor||0)+t,n.idleFor>2.5&&(n.idleFor=0,n.runCleanup(),n.enqueue(this.goHome(n)))):n.idleFor=0,n.update(t,e)}!this.meeting&&e>this.nextMeeting&&(this.startMeeting()||(this.nextMeeting=e+30))}};var of={company:"Bal\xE3o da Inform\xE1tica",president:{name:"Thiago Herrera",title:"Presidente"},people:[{id:"thiago",name:"Thiago Herrera",role:"Presidente",dept:"Presid\xEAncia",avatar:"Business_Male_01",seat:"thiago",kind:"president",color:"#ed3237",desc:"Comanda a Bal\xE3o da Inform\xE1tica. Define prioridades, acompanha os setores e recebe os reportes dos agentes.",workLabel:"Despachando na Presid\xEAncia",errands:[{spot:"pres.lounge",role:"text",label:"Lendo mensagens no celular",icon:"\u{1F4F1}",dur:[10,16],prop:"phone"}]},{id:"hermes",name:"Hermes",role:"Orquestrador-chefe dos agentes",dept:"Opera\xE7\xF5es",avatar:"Business_Male_02",seat:"hermes",kind:"chief",color:"#06b6d4",desc:"Distribui as tarefas entre os agentes, acompanha a execu\xE7\xE3o e reporta ao Presidente.",workLabel:"Orquestrando as tarefas",errands:[{spot:"ops.wall",role:"listen",clip:"gestic_thoughtful_01",label:"Acompanhando a central de orquestra\xE7\xE3o",icon:"\u{1F5A5}\uFE0F",dur:[10,16]},{spot:"ops.t1",role:"text",label:"Disparando tarefas pelo celular",icon:"\u{1F4F1}",dur:[9,14],prop:"phone"}]},{id:"vendas",name:"Agente de Vendas",role:"Vendas \xB7 Bling ERP e CRM",dept:"Vendas & Atendimento",avatar:"Business_Male_06",seat:"vendas",kind:"head",color:"#10b981",desc:"Cuida dos pedidos, do estoque e do cat\xE1logo, e acompanha o time de atendimento.",workLabel:"Acompanhando pedidos e estoque",errands:[{spot:"vendas.board",role:"present",label:"Revisando as metas no quadro",icon:"\u{1F4CA}",dur:[10,16],speaking:!0},{spot:"vendas.printer",role:"docs",label:"Conferindo pedidos impressos",icon:"\u{1F9FE}",dur:[9,14]}]},{id:"mercado",name:"Agente de Mercado",role:"Intelig\xEAncia de pre\xE7os",dept:"Intelig\xEAncia de Mercado",avatar:"Business_Male_05",seat:"mercado",kind:"head",color:"#f59e0b",desc:"Acompanha os pre\xE7os da concorr\xEAncia e avisa sobre as margens antes de cada or\xE7amento.",workLabel:"Comparando pre\xE7os da concorr\xEAncia",errands:[{spot:"mercado.tv",role:"listen",clip:"gestic_thoughtful_01",label:"Analisando o monitor de pre\xE7os",icon:"\u{1F4C8}",dur:[10,16]},{spot:"mercado.board",role:"present",label:"Anotando margens no quadro",icon:"\u{1F4DD}",dur:[9,14]}]},{id:"criativo",name:"Agente Criativo",role:"Est\xFAdio de artes e v\xEDdeos",dept:"Est\xFAdio Criativo",avatar:"Male_Adult_04",seat:"criativo",kind:"head",color:"#d946ef",desc:"Produz as artes, os cartazes e os v\xEDdeos das campanhas da loja.",workLabel:"Criando artes da campanha",errands:[{spot:"criativo.photo",role:"workMid",label:"Fotografando o PC Gamer no est\xFAdio",icon:"\u{1F4F8}",dur:[10,16]},{spot:"criativo.posters",role:"listen",clip:"gestic_thoughtful_01",label:"Revisando os cartazes",icon:"\u{1F3A8}",dur:[8,13]}]},{id:"ti",name:"Agente de TI",role:"Infraestrutura \xB7 VPS e deploy",dept:"TI & Servidores",avatar:"Business_Male_07",seat:"ti",kind:"head",color:"#3b82f6",desc:"Mant\xE9m os servidores, os containers e o deploy do site e do WhatsApp no ar.",workLabel:"Monitorando os servidores",errands:[{spot:"ti.rack",role:"workMid",label:"Verificando os racks de servidores",icon:"\u{1F5C4}\uFE0F",dur:[10,17]},{spot:"ti.bench",role:"workStand",label:"Montando m\xE1quina na bancada",icon:"\u{1F6E0}\uFE0F",dur:[10,16]}]},{id:"financeiro",name:"Agente Financeiro",role:"Pagamentos \xB7 PIX e cobran\xE7as",dept:"Financeiro",avatar:"Business_Female_03",seat:"financeiro",kind:"head",color:"#14b8a6",desc:"Gera as cobran\xE7as, confere os comprovantes e acompanha os recebimentos.",workLabel:"Conferindo recebimentos",errands:[{spot:"fin.files",role:"docs",label:"Consultando os arquivos",icon:"\u{1F5C2}\uFE0F",dur:[9,15]}]},{id:"julia",name:"JUL.IA",role:"Vendedora digital",dept:"Vendas & Atendimento",avatar:"Business_Female_04",seat:"julia",kind:"staff",color:"#10b981",desc:"Atende os clientes da loja pelo WhatsApp.",workLabel:"Atendendo clientes no WhatsApp",errands:[{spot:"vendas.t1",role:"text",label:"Respondendo cliente no celular",icon:"\u{1F4F1}",dur:[9,14],prop:"phone"},{spot:"vendas.printer",role:"docs",label:"Pegando um or\xE7amento impresso",icon:"\u{1F9FE}",dur:[8,12]}]},{id:"vitoria",name:"VITOR.IA",role:"Prospec\xE7\xE3o",dept:"Vendas & Atendimento",avatar:"Business_Female_01",seat:"vitoria",kind:"staff",color:"#10b981",desc:"Busca novos clientes e abre as primeiras conversas.",workLabel:"Prospectando novos clientes",errands:[{spot:"vendas.t2",role:"text",label:"Enviando mensagens de prospec\xE7\xE3o",icon:"\u{1F4F1}",dur:[9,14],prop:"phone"},{spot:"vendas.board",role:"present",label:"Atualizando a lista de contatos",icon:"\u{1F4CB}",dur:[8,13]}]},{id:"claudia",name:"CLAUD.IA",role:"Cobran\xE7a e reativa\xE7\xE3o",dept:"Vendas & Atendimento",avatar:"Business_Female_02",seat:"claudia",kind:"staff",color:"#10b981",desc:"Cobra pend\xEAncias e reativa clientes que pararam de comprar.",workLabel:"Fazendo cobran\xE7as e reativa\xE7\xF5es",errands:[{spot:"vendas.printer",role:"docs",label:"Conferindo boletos",icon:"\u{1F9FE}",dur:[8,13]},{spot:"vendas.t1",role:"text",label:"Reativando um cliente",icon:"\u{1F4F1}",dur:[9,14],prop:"phone"}]},{id:"maria",name:"MAR.IA",role:"An\xE1lise",dept:"Vendas & Atendimento",avatar:"Female_Adult_15",seat:"maria",kind:"staff",color:"#10b981",desc:"Analisa as conversas e os resultados do atendimento.",workLabel:"Analisando os atendimentos",errands:[{spot:"vendas.board",role:"present",label:"Apresentando a an\xE1lise do dia",icon:"\u{1F4CA}",dur:[9,14],speaking:!0},{spot:"vendas.t2",role:"docs",label:"Lendo o relat\xF3rio",icon:"\u{1F4C4}",dur:[8,13]}]},{id:"recepcao",name:"Recep\xE7\xE3o",role:"Atendimento na entrada",dept:"Recep\xE7\xE3o",avatar:"Female_Adult_02",seat:"recepcao",kind:"reception",color:"#ed3237",desc:"Recebe quem chega e encaminha para o setor certo.",workLabel:"Atendendo na recep\xE7\xE3o",errands:[{spot:"recepcao.wait",role:"idle",label:"Organizando a sala de espera",icon:"\u{1FAB4}",dur:[8,12]}]}]};var Ba=[{h:0,dir:[-.1,1,.16],sun:16773340,si:1.2,sky:11123676,gnd:6248013,hi:.62,lamp:1.4,env:.26,gt:.17,top:66e4,bot:1778739,exp:1.12,pan:2,beam:0},{h:5.2,dir:[-.1,1,.16],sun:16773340,si:1.2,sky:11123676,gnd:6248013,hi:.62,lamp:1.4,env:.26,gt:.17,top:66e4,bot:1778739,exp:1.12,pan:2,beam:0},{h:6.6,dir:[.92,.36,.42],sun:16762780,si:1.9,sky:16768194,gnd:12102300,hi:.8,lamp:.5,env:.34,top:10470376,bot:16243910,exp:1,gt:.7,pan:1,beam:0},{h:9,dir:[.72,.82,.56],sun:16773598,si:2.9,sky:15922943,gnd:13617341,hi:1,lamp:.2,env:.42,top:12442098,bot:15660022,exp:1,gt:1,pan:0,beam:0},{h:12.5,dir:[.08,1,.46],sun:16777215,si:3.2,sky:16777215,gnd:13617341,hi:1,lamp:.16,env:.44,top:12836083,bot:15660022,exp:1,gt:1,pan:0,beam:.25},{h:15.5,dir:[-.45,.86,.5],sun:16773596,si:3.1,sky:16777215,gnd:13617341,hi:1,lamp:.2,env:.42,top:13624307,bot:15660022,exp:1,gt:1,pan:0,beam:.7},{h:17.5,dir:[-.86,.46,.4],sun:16757865,si:2.9,sky:16767413,gnd:13218719,hi:.82,lamp:.55,env:.36,top:9417436,bot:16762778,exp:1,gt:.86,pan:1,beam:1},{h:18.5,dir:[-.9,.3,.34],sun:16747868,si:1.5,sky:14467264,gnd:9404536,hi:.7,lamp:.95,env:.3,top:4018040,bot:15768184,exp:1.02,gt:.5,pan:1,beam:.6},{h:19.4,dir:[-.1,1,.16],sun:16773340,si:1.2,sky:11123676,gnd:6248013,hi:.62,lamp:1.4,env:.26,gt:.17,top:66e4,bot:1778739,exp:1.12,pan:2,beam:0},{h:24,dir:[-.1,1,.16],sun:16773340,si:1.2,sky:11123676,gnd:6248013,hi:.62,lamp:1.4,env:.26,gt:.17,top:66e4,bot:1778739,exp:1.12,pan:2,beam:0}],qr={auto:null,manha:9.5,tarde:15.5,por:17.6,noite:21},af={auto:"Hora real",manha:"Manh\xE3",tarde:"Tarde",por:"P\xF4r do sol",noite:"Noite"},Ov=new Wt,kv=new Wt;function lf(i,t={}){let e=0;for(;e<Ba.length-2&&i>=Ba[e+1].h;)e++;let n=Ba[e],s=Ba[e+1],r=(i-n.h)/Math.max(1e-6,s.h-n.h);r=r*r*(3-2*r);let o=c=>n[c]+(s[c]-n[c])*r,a=(c,h)=>(h||new Wt).copy(Ov.set(n[c])).lerp(kv.set(s[c]),r);return t.dir=(t.dir||new I).set(n.dir[0]+(s.dir[0]-n.dir[0])*r,n.dir[1]+(s.dir[1]-n.dir[1])*r,n.dir[2]+(s.dir[2]-n.dir[2])*r).normalize(),t.sun=a("sun",t.sun),t.si=o("si"),t.sky=a("sky",t.sky),t.gnd=a("gnd",t.gnd),t.hi=o("hi"),t.lamp=o("lamp"),t.env=o("env"),t.top=a("top",t.top),t.bot=a("bot",t.bot),t.exp=o("exp"),t.gt=o("gt"),t.beam=o("beam"),t.pan=r<.5?n.pan:s.pan,t.night=t.lamp>1.2&&n.pan===2&&s.pan===2,t.hour=i,t}function cf(){let i=new Date;return i.getHours()+i.getMinutes()/60+i.getSeconds()/3600}var Ha=class{constructor(){this.on=!1,this.ctx=null,this.voices=new Map,this.t=0}enable(){if(!this.ctx){let t=window.AudioContext||window.webkitAudioContext;if(!t)return!1;this.ctx=new t,this.build()}return this.ctx.resume(),this.on=!0,this.master.gain.cancelScheduledValues(this.ctx.currentTime),this.master.gain.linearRampToValueAtTime(.9,this.ctx.currentTime+.5),!0}disable(){this.ctx&&(this.on=!1,this.master.gain.cancelScheduledValues(this.ctx.currentTime),this.master.gain.linearRampToValueAtTime(0,this.ctx.currentTime+.3))}build(){let t=this.ctx;this.master=t.createGain(),this.master.gain.value=0;let e=t.createDynamicsCompressor();this.master.connect(e),e.connect(t.destination);let n=(s,r)=>{let o=t.createBuffer(1,Math.floor(t.sampleRate*s),t.sampleRate),a=o.getChannelData(0);return r(a),o};this.white=n(2,s=>{for(let r=0;r<s.length;r++)s[r]=Math.random()*2-1}),this.brown=n(3,s=>{let r=0;for(let o=0;o<s.length;o++)r=(r+.02*(Math.random()*2-1))/1.02,s[o]=r*3.5}),this.click=n(.03,s=>{for(let r=0;r<s.length;r++){let o=Math.exp(-r/(s.length*.18));s[r]=(Math.random()*2-1)*o}}),this.thud=n(.09,s=>{let r=0;for(let o=0;o<s.length;o++){let a=Math.exp(-o/(s.length*.22));r=(r+.12*(Math.random()*2-1))/1.12,s[o]=r*a*6}});{let s=t.createBufferSource();s.buffer=this.brown,s.loop=!0;let r=t.createBiquadFilter();r.type="lowpass",r.frequency.value=420;let o=t.createGain();o.gain.value=.05,s.connect(r),r.connect(o),o.connect(this.master),s.start()}}panner(t,e,n,s=1.6,r=1.5){let o=this.ctx.createPanner();return o.panningModel="equalpower",o.distanceModel="inverse",o.refDistance=s,o.rolloffFactor=r,o.maxDistance=60,o.positionX.value=t,o.positionY.value=e,o.positionZ.value=n,o.connect(this.master),o}loopAt(t,e,n,s,{buffer:r="brown",type:o="lowpass",freq:a=200,q:c=.7,gain:h=.3,ref:l=1.4,hum:u=0}={}){if(this.voices.has(t))return this.voices.get(t);let d=this.ctx,f=d.createBufferSource();f.buffer=this[r],f.loop=!0;let p=d.createBiquadFilter();p.type=o,p.frequency.value=a,p.Q.value=c;let x=d.createGain();x.gain.value=h;let g=this.panner(e,n,s,l,1.7);if(f.connect(p),p.connect(x),x.connect(g),f.start(),u){let w=d.createOscillator();w.frequency.value=u;let E=d.createGain();E.gain.value=h*.12,w.connect(E),E.connect(g),w.start()}let m={g:x,f:p,p:g,base:h};return this.voices.set(t,m),m}burst(t,e,n,s,{gain:r=.2,type:o="bandpass",freq:a=3e3,q:c=1,rate:h=1,ref:l=1.2}={}){if(!this.on)return;let u=this.ctx,d=u.createBufferSource();d.buffer=this[t],d.playbackRate.value=h;let f=u.createBiquadFilter();f.type=o,f.frequency.value=a,f.Q.value=c;let p=u.createGain();p.gain.value=r;let x=this.panner(e,n,s,l,1.6);d.connect(f),f.connect(p),p.connect(x),d.start(),d.onended=()=>{try{x.disconnect()}catch{}}}ui(t=880){if(!this.on)return;let e=this.ctx,n=e.createOscillator(),s=e.createGain();n.type="sine",n.frequency.setValueAtTime(t,e.currentTime),n.frequency.exponentialRampToValueAtTime(t*1.5,e.currentTime+.07),s.gain.setValueAtTime(.06,e.currentTime),s.gain.exponentialRampToValueAtTime(1e-4,e.currentTime+.14),n.connect(s),s.connect(this.master),n.start(),n.stop(e.currentTime+.15)}printer(t,e,n){if(!this.on)return;let s=this.ctx,r=s.createBufferSource();r.buffer=this.white;let o=s.createBiquadFilter();o.type="bandpass",o.frequency.value=1400,o.Q.value=1.2;let a=s.createGain(),c=s.currentTime;a.gain.setValueAtTime(0,c),a.gain.linearRampToValueAtTime(.16,c+.15);let h=s.createOscillator();h.frequency.value=9;let l=s.createGain();l.gain.value=.06,h.connect(l),l.connect(a.gain),h.start(c),h.stop(c+2.7),a.gain.setValueAtTime(.16,c+2.3),a.gain.linearRampToValueAtTime(0,c+2.6);let u=this.panner(t,e,n,1.6,1.4);r.connect(o),o.connect(a),a.connect(u),r.start(c),r.stop(c+2.7),r.onended=()=>{try{u.disconnect()}catch{}}}chime(){if(!this.on)return;let t=this.ctx;[660,880,1320].forEach((e,n)=>{let s=t.createOscillator(),r=t.createGain();s.type="sine",s.frequency.value=e;let o=t.currentTime+n*.09;r.gain.setValueAtTime(0,o),r.gain.linearRampToValueAtTime(.07,o+.02),r.gain.exponentialRampToValueAtTime(1e-4,o+.5),s.connect(r),r.connect(this.master),s.start(o),s.stop(o+.55)})}update(t,{listener:e,forward:n,up:s,sim:r,world:o}){if(!this.on||!this.ctx)return;let a=this.ctx,c=a.listener,h=a.currentTime;c.positionX?(c.positionX.setTargetAtTime(e.x,h,.05),c.positionY.setTargetAtTime(e.y,h,.05),c.positionZ.setTargetAtTime(e.z,h,.05),c.forwardX.setTargetAtTime(n.x,h,.05),c.forwardY.setTargetAtTime(n.y,h,.05),c.forwardZ.setTargetAtTime(n.z,h,.05),c.upX.value=s.x,c.upY.value=s.y,c.upZ.value=s.z):(c.setPosition(e.x,e.y,e.z),c.setOrientation(n.x,n.y,n.z,s.x,s.y,s.z));let l=this.loopAt("racks",8.3,1.2,4.9,{freq:260,gain:.5,ref:1.6,hum:118});l.g.gain.setTargetAtTime(.5+(o.alertShown||0)*.5,h,.3),l.f.frequency.setTargetAtTime(260+(o.alertShown||0)*500,h,.3),this.loopAt("fridge",17.6,1,7.2,{freq:140,gain:.16,ref:1.2,hum:60}),this.t+=t;for(let u of r.agents){let d=u.pos.x,f=u.pos.z;if(u.state==="seated"&&u.handMode==="type"&&u.wL>.8){if(u._key=(u._key||0)-t,u._key<=0){let x=Math.random()<.12;u._key=x?.5+Math.random()*1.4:.07+Math.random()*.16,x||this.burst("click",d,.8,f,{gain:.12+Math.random()*.08,freq:2400+Math.random()*2600,q:1.4,rate:.9+Math.random()*.5})}}else u.handMode==="mouse"&&u.wM>.8&&(u._key=(u._key||0)-t,u._key<=0&&(u._key=.9+Math.random()*2.2,this.burst("click",d,.8,f,{gain:.1,freq:1500,q:2,rate:.7})));if(u.curRole==="walk"&&u.cur){let x=Math.floor(u.cur.time/(u.cur.getClip().duration/2));x!==u._step&&(u._step=x,this.burst("thud",d,.05,f,{gain:.5,type:"lowpass",freq:520,q:.6,rate:.9+Math.random()*.3,ref:1.5}))}let p=u.step&&u.step.t==="act"&&u.step.label==="Preparando o caf\xE9";if(p&&!u._brew)u._brew=!0,this.loopAt("coffee",17.6,1.1,3.9,{buffer:"white",type:"highpass",freq:2600,gain:0,ref:1.3}).g.gain.setTargetAtTime(.13,h,.4);else if(!p&&u._brew){u._brew=!1;let x=this.voices.get("coffee");x&&x.g.gain.setTargetAtTime(0,h,.5)}}}};var At=i=>document.querySelector(i),Yr=Object.assign({},of,window.OFFICE_CONFIG||{}),Wn=new URLSearchParams(location.search),Va={get(i){try{return localStorage.getItem(i)}catch{return null}},set(i,t){try{localStorage.setItem(i,t)}catch{}}},Ks=(i,t)=>{let e=At("#load-bar");e&&(e.style.width=Math.round(i*100)+"%");let n=At("#load-msg");n&&t&&(n.textContent=t)},Ii=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;async function zv(){if(window.OFFICE_ASSETS_B64){let o=await Hd(window.OFFICE_ASSETS_B64);return window.OFFICE_ASSETS_B64=null,o}let i=window.OFFICE_ASSETS_URL||Wn.get("pack")||"../build/assets.bin",t=/\.(gz|pack)(\?|$)/.test(i),e=await fetch(i);if(!e.ok)throw new Error("n\xE3o consegui baixar os modelos ("+e.status+")");let n=+e.headers.get("content-length")||window.OFFICE_ASSETS_SIZE||0,s;if(e.body&&n){let o=e.body.getReader(),a=[],c=0;for(;;){let{done:h,value:l}=await o.read();if(h)break;a.push(l),c+=l.length,Ks(.03+.17*Math.min(1,c/n),`Baixando os modelos\u2026 ${(c/1048576).toFixed(1)} de ${(n/1048576).toFixed(1)} MB`)}s=new Blob(a)}else s=await e.blob();let r=t?await new Response(s.stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer():await s.arrayBuffer();return new Cr(r)}async function Bv(){Ks(.03,"Abrindo os arquivos\u2026");let i=await zv();Ks(.22,"Montando o escrit\xF3rio\u2026"),Ii&&document.body.classList.add("touch");let t=At("#scene"),e=new Bo({canvas:t,antialias:!0,powerPreference:"high-performance",preserveDrawingBuffer:Wn.has("shot")});e.outputColorSpace=Pe,e.toneMapping=Yc,e.toneMappingExposure=1.02,e.shadowMap.enabled=!0,e.shadowMap.type=qc,e.localClippingEnabled=!0;let n=new bi,s=qe(4,256),r=un(s);n.background=r;let o=new Ps(e);n.environment=o.fromScene(new pa,.04).texture,n.environmentIntensity=.42;let a=new ta(16777215,13617341,1);n.add(a);let c=new na(16773596,3.1);c.target.position.set(0,0,0),n.add(c,c.target),c.castShadow=!0;let h=c.shadow.camera;h.left=-27,h.right=27,h.top=27,h.bottom=-27,h.near=4,h.far=110,c.shadow.bias=-4e-4,c.shadow.normalBias=.035,c.shadow.radius=2.5;let l=new Be(38,window.innerWidth/window.innerHeight,.08,500),u={logo:await Ir(i,"img/logo.webp"),dollar:await Ir(i,"img/dollar.webp"),wood:await Ir(i,"img/wood.webp")};{let M=u.logo.image,L=qe(M.width,M.height),N=L.getContext("2d");N.drawImage(M,0,0),N.globalCompositeOperation="source-in",N.fillStyle="#fff",N.fillRect(0,0,L.width,L.height),u.logoWhite=un(L),u.logoWhite.flipY=!1}u.logo.wrapS=u.logo.wrapT=Nn,u.dollar.wrapS=u.dollar.wrapT=Nn;let d=ef({scene:n,tex:u,config:Yr}),f=new Na({x1:ft.x1,x2:ft.x2,z1:ft.z1,z2:ft.z2},d.obstacles);for(let M of d.chairs){let L=new I(Math.sin(M.yaw),0,Math.cos(M.yaw));for(let N=0;N<=4;N++){let P=.12-(M.rollBack+.08)*N/4;f.blockCircle(M.pos.x+L.x*P,M.pos.z+L.z*P,.3)}}let p=new ka({world:d,nav:f,pack:i,config:Yr});(Ii||navigator.deviceMemory&&navigator.deviceMemory<=4||Wn.has("lite"))&&(Pr.max=1024);let x=Yr.people,g=0;for(let M of x){Ks(.26+.7*(g++/x.length),`Chamando a equipe\u2026 ${M.name}`),M.gender=/Female/.test(M.avatar)?"f":"m";let L=Gd(await Vd(i,M.avatar));n.add(L.rig),L.mesh.receiveShadow=!1;let N=p.add(M,L),P=new qt(new Ls(.33,.33,1.8,8),new Ee({visible:!1}));P.userData.agent=N,N.proxy=P,n.add(P),await new Promise($=>setTimeout($,0))}{let M=p.byId.get("thiago"),L=p.byId.get("hermes");L.nextPlan=0,p.visit(L,M,{dur:22,topic:"Alinhando prioridades com o Presidente"});let N=M.home.visitor[0];L.state="idle",L.seat=null,L.pos.set(N[0],0,N[1]+.9),L.yaw=Math.PI,L.play("idle",{fade:0}),L.home.rolled=1,L.home.free=!0,d.placeChair(L.home),L.yOff=0,p.agents.forEach((P,$)=>{P!==M&&P!==L&&(P.nextPlan=3+$*3.1+Math.random()*4)}),M.nextPlan=45}let m=new qt(new $o(.42,.5,40),new Ee({color:15544887,transparent:!0,opacity:.9,depthWrite:!1}));m.rotation.x=-Math.PI/2,m.visible=!1,m.renderOrder=5,n.add(m);let w=new fa(l,t);w.enableDamping=!0,w.dampingFactor=.08,w.minDistance=4,w.maxDistance=85,w.maxPolarAngle=1.42,w.screenSpacePanning=!1,w.zoomSpeed=.9,w.rotateSpeed=.55;let E={pos:new I(-7.2,23.5,25.5),target:new I(-.9,0,-.5)},S={pos:E.pos.clone(),target:E.target.clone(),k:1},V=()=>{let M=window.innerWidth/Math.max(1,window.innerHeight);S.k=Bn.clamp(1.45/M,1,2.1),S.pos.copy(E.pos).sub(E.target).multiplyScalar(S.k).add(E.target)};V();let O={target:new I(0,0,0),dir:new I(-.42,.72,.78).normalize(),dist:150},y={mode:"overview",selected:null,follow:null,intro:null,tourT:0,keys:{},yaw:-Math.PI/2,pitch:0,fpPos:new I(16.2,1.68,0),locked:!1,labels:!0,time:0,flight:null,joy:{x:0,y:0},cam:0,camT:0,camAuto:!0,cine:null,quality:null,save:{}};l.position.copy(S.pos),w.target.copy(S.target),w.update();let R=null;function A(M,L=!0){y.quality=M,L&&Va.set("office3d.q",M);let N=M==="high",P=!N&&y.lite;e.setPixelRatio(+Wn.get("pr")||Math.min(window.devicePixelRatio||1,N?2:P?1:1.5)),e.setSize(window.innerWidth,window.innerHeight);let $=N?4096:P?1024:2048;if(c.shadow.mapSize.x!==$&&(c.shadow.mapSize.set($,$),c.shadow.map&&(c.shadow.map.dispose(),c.shadow.map=null)),N&&!R)try{R=new La(e,{msaa:4,ao:!0})}catch(vt){console.warn("p\xF3s-processamento indispon\xEDvel",vt),R=null}if(R){let vt=e.getDrawingBufferSize(new yt);R.setSize(vt.x,vt.y)}y.post=N&&!!R,p.detail=!P,d.lamps.forEach((vt,Ut)=>{vt.visible=N||!P&&Ut%3===0});let j=At("#quality-label");j&&(j.textContent=N?"Alta":"Leve"),W.shown>-90&&J(!0)}let b={t:0,n:0,acc:0,done:Wn.has("shot")};y.perfOff=()=>{b.done=!0};function D(M){if(b.done||M>.5||document.visibilityState!=="visible"||(b.t+=M,b.t<4)||(b.acc+=M,++b.n<90))return;let L=b.acc/b.n;b.t=1.5,b.n=0,b.acc=0,L>1/27&&y.quality==="high"?(A("low"),F.toast("Ajustei para a qualidade leve para ficar fluido neste aparelho. Para voltar: \u22EF \u2192 Qualidade gr\xE1fica.")):(L>1/22&&y.quality==="low"&&!y.lite&&(y.lite=!0,A("low")),b.done=!0)}let W={preset:Va.get("office3d.time")||"auto",hour:0,shown:-99,s:{},exposure:1};W.preset in qr||(W.preset="auto"),Wn.get("hora")&&(W.preset=Wn.get("hora")in qr?Wn.get("hora"):"auto");let Z=()=>W.preset==="auto"?cf():qr[W.preset];W.hour=Z();function J(M){if(!M&&Math.abs(W.hour-W.shown)<.004)return;W.shown=W.hour;let L=lf(W.hour,W.s);c.position.copy(L.dir).multiplyScalar(50),c.color.copy(L.sun),c.intensity=L.si,a.color.copy(L.sky),a.groundColor.copy(L.gnd),a.intensity=L.hi*(y.quality==="low"?1+.22*Math.min(1,L.lamp):1),n.environmentIntensity=L.env;for(let j of d.lamps)j.intensity=j.userData.base*L.lamp;let N=s.getContext("2d"),P=N.createLinearGradient(0,0,0,256);P.addColorStop(0,"#"+L.top.getHexString()),P.addColorStop(.62,"#"+L.bot.getHexString()),P.addColorStop(1,"#"+L.bot.clone().multiplyScalar(.9).getHexString()),N.fillStyle=P,N.fillRect(0,0,4,256),r.needsUpdate=!0,d.setSky(L.pan),d.groundMat.color.setHex(14278112).multiplyScalar(L.gt),W.exposure=L.exp,e.toneMappingExposure=1.02*L.exp,document.body.dataset.day=L.night?"night":"day";let $=At("#day-chip");if($){let j=W.hour;$.textContent=L.night?"noite":j<12?"manh\xE3":j<17?"tarde":"p\xF4r do sol"}}function rt(M){M in qr&&(W.preset=M,Va.set("office3d.time",M),document.querySelectorAll("[data-time]").forEach(L=>L.classList.toggle("on",L.dataset.time===M)),At("#time-label").textContent=af[M])}let K=(M,L,N=1.4)=>{y.flight={p0:l.position.clone(),t0:w.target.clone(),p1:M.clone(),t1:L.clone(),t:0,dur:N}},ct=[[[19.5,1.7,.2],[10,1.5,-1.2],5],[[14.2,1.7,-1.6],[14.3,1.6,-8.5],5],[[9.5,1.75,0],[0,1.4,-.6],5],[[4.2,1.7,-.2],[6.5,1.2,-5.5],5],[[.9,1.7,-.6],[-2.5,1.2,-6.5],6],[[-1.4,1.7,.4],[-.5,1.2,5.5],5],[[5.8,1.7,.6],[7.6,1.1,5.2],5],[[-6.4,1.7,.5],[-8.4,1.1,5.2],5],[[-12.2,1.7,.6],[-13.5,1.3,5],5],[[-10.2,1.7,-.2],[-12,1.5,-5.5],5],[[-10.4,1.72,-3],[-12.8,1.75,-8.5],7],[[-11.9,1.7,-4.6],[-9.12,1.62,-8.5],6],[[-14.6,1.7,-5.4],[-12.6,1.5,-7],6],[[-10,1.8,-1],[-4,1.4,0],4]],tt=ct.reduce((M,L)=>M+L[2],0),et=(M,L,N,P,$)=>.5*(2*L+(-M+N)*$+(2*M-5*L+4*N-P)*$*$+(-M+3*L-3*N+P)*$*$*$),_t=(M,L,N)=>{let P=(M%tt+tt)%tt,$=0;for(;P>ct[$][2];)P-=ct[$][2],$++;let j=P/ct[$][2],vt=ct.length,Ut=Ct=>ct[($+Ct+vt)%vt],Xt=j*j*(3-2*j)*.6+j*.4;for(let Ct=0;Ct<3;Ct++)L.setComponent(Ct,et(Ut(-1)[0][Ct],Ut(0)[0][Ct],Ut(1)[0][Ct],Ut(2)[0][Ct],Xt)),N.setComponent(Ct,et(Ut(-1)[1][Ct],Ut(0)[1][Ct],Ut(1)[1][Ct],Ut(2)[1][Ct],Xt))},It=[["RECEP\xC7\xC3O",[17.55,2.62,-8.05],[13.4,.9,-4.4]],["PRESID\xCANCIA",[-8.45,2.62,-1.95],[-13.4,.8,-6.6]],["VENDAS & ATENDIMENTO",[2.55,2.62,-1.95],[-3.4,.7,-5.6]],["SALA DE REUNI\xC3O",[9.55,2.62,-1.95],[6.2,.7,-5.5]],["CORREDOR",[17.4,2.62,1.15],[0,.6,-.1]],["OPERA\xC7\xD5ES",[-17.55,2.62,8.05],[-13.2,.8,4.6]],["INTELIG\xCANCIA DE MERCADO",[-10.55,2.62,8.05],[-7.6,.7,4.4]],["EST\xDADIO CRIATIVO",[-4.55,2.62,8.05],[-.8,.7,4.9]],["TI & SERVIDORES",[2.45,2.62,8.05],[6.2,.8,4.6]],["FINANCEIRO",[9.45,2.62,8.05],[11.9,.7,4.8]],["COPA",[14.45,2.62,8.05],[16.4,.8,4.6]]],wt={overview:Ii?"Arraste para girar \xB7 pin\xE7a aproxima \xB7 dois dedos movem \xB7 toque numa pessoa ou numa tela":"Arraste para girar \xB7 roda do mouse aproxima \xB7 bot\xE3o direito move \xB7 clique numa pessoa ou numa tela",fpv:Ii?"Use o controle \xE0 esquerda para andar \xB7 arraste a tela para olhar":"Clique na cena para olhar com o mouse \xB7 W A S D para andar \xB7 Shift corre \xB7 Esc solta o mouse",tour:"Tour autom\xE1tico pelo escrit\xF3rio \xB7 escolha outra vis\xE3o para sair",maquete:Ii?"Maquete: arraste para girar \xB7 pin\xE7a aproxima":"Maquete: arraste para girar \xB7 roda do mouse aproxima",cine:Ii?"Acompanhando a reuni\xE3o geral \xB7 toque para voltar":"Acompanhando a reuni\xE3o geral \xB7 clique para voltar",follow:""};function Qt(){let M=window.innerWidth,L=window.innerHeight,N=(y.mode==="overview"||y.mode==="maquete")&&M>1100&&!document.body.classList.contains("team-off")?Math.round(Math.min(160,M*.1)):0;N?l.setViewOffset(M,L,-N,0,M,L):l.clearViewOffset()}y.applyOffset=Qt;function st(M,L={}){if(M===y.mode&&!L.force)return;let N=y.mode;if((N==="overview"||N==="maquete")&&(y.save[N]={pos:l.position.clone(),target:w.target.clone()}),y.mode=M,y.flight=null,y.intro=null,M!=="cine"&&(y.cine=null),document.body.dataset.mode=M,document.querySelectorAll("[data-mode-btn]").forEach(P=>P.classList.toggle("on",P.dataset.modeBtn===M)),M!=="fpv"&&document.pointerLockElement&&document.exitPointerLock(),w.enabled=M==="overview"||M==="maquete",M==="overview"){let P=y.save.overview||S;l.fov=38,w.minDistance=4,w.maxDistance=85*S.k,(N!=="overview"||L.home)&&(l.position.copy(L.home?S.pos:P.pos),w.target.copy(L.home?S.target:P.target))}if(M==="maquete"){let P=y.save.maquete;l.fov=12.5,w.minDistance=70,w.maxDistance=300,w.target.copy(P?P.target:O.target),l.position.copy(P?P.pos:O.target.clone().addScaledVector(O.dir,O.dist))}if(M==="fpv"&&(l.fov=68,N==="follow"&&y.follow&&y.fpPos.set(y.follow.pos.x,1.68,y.follow.pos.z+1.2),y.pitch=0),M==="tour"&&(l.fov=62,y.tourT=L.at||0),M==="cctv"&&(l.fov=78,y.camT=0,L.cam!==void 0&&(y.cam=L.cam)),M==="cine"&&(l.fov=42),M==="follow"&&(l.fov=55,y.follow=L.agent||y.selected||p.byId.get("thiago"),y.followYaw=void 0,Et(`Seguindo ${y.follow.def.name} \xB7 escolha outra vis\xE3o para sair`)),wt[M])Et(wt[M]);else if(M!=="follow"){let P=At("#hint");P&&P.classList.remove("show")}Qt(),l.updateProjectionMatrix(),(M==="overview"||M==="maquete")&&w.update()}let ht=0,Et=M=>{let L=At("#hint");L&&(L.textContent=M,L.classList.add("show"),clearTimeout(ht),ht=setTimeout(()=>L.classList.remove("show"),8e3))};t.addEventListener("click",()=>{if(y.mode==="fpv"&&!y.locked&&!Ii&&t.requestPointerLock)try{let M=t.requestPointerLock();M&&M.catch&&M.catch(()=>{})}catch{}}),document.addEventListener("pointerlockchange",()=>{y.locked=document.pointerLockElement===t,document.body.classList.toggle("locked",y.locked)});let mt=null;t.addEventListener("pointerdown",M=>{mt={x:M.clientX,y:M.clientY,moved:0},y.mode==="cine"&&st("overview",{home:!0})}),window.addEventListener("pointermove",M=>{if(y.mode==="fpv"){let L=0,N=0;y.locked?(L=M.movementX,N=M.movementY):mt&&(M.buttons||M.pointerType==="touch")&&(L=-(M.clientX-mt.x)*1.4,N=-(M.clientY-mt.y)*1.4,mt.moved+=Math.abs(L)+Math.abs(N),mt.x=M.clientX,mt.y=M.clientY),y.yaw-=L*.0022,y.pitch=Bn.clamp(y.pitch-N*.0022,-1.2,1.2)}else mt&&M.buttons&&(mt.moved+=Math.abs(M.movementX)+Math.abs(M.movementY))}),window.addEventListener("keydown",M=>{if(M.target&&/INPUT|TEXTAREA/.test(M.target.tagName))return;y.keys[M.code]=!0;let L={Digit1:"overview",Digit2:"fpv",Digit3:"tour",Digit4:"cctv",Digit5:"maquete"}[M.code];L&&st(L),M.code==="KeyR"&&F.meeting(),M.code==="KeyL"&&F.toggleLabels(),M.code==="KeyM"&&F.toggleSound(),M.code==="Digit0"&&st("overview",{force:!0,home:!0}),y.mode==="cctv"&&(M.code==="ArrowRight"&&F.cam(1),M.code==="ArrowLeft"&&F.cam(-1)),M.code==="Escape"&&(At("#pip").classList.remove("show"),pe()),M.code==="Space"&&y.mode==="fpv"&&M.preventDefault()}),window.addEventListener("keyup",M=>{y.keys[M.code]=!1}),window.addEventListener("blur",()=>{y.keys={}});{let M=At("#stick"),L=M.querySelector("i"),N=null,P=j=>{let vt=M.getBoundingClientRect(),Ut=(j.clientX-vt.left-vt.width/2)/(vt.width/2),Xt=(j.clientY-vt.top-vt.height/2)/(vt.height/2),Ct=Math.hypot(Ut,Xt);Ct>1&&(Ut/=Ct,Xt/=Ct),y.joy.x=Ut,y.joy.y=Xt,L.style.transform=`translate(${Ut*32}px,${Xt*32}px)`};M.addEventListener("pointerdown",j=>{N=j.pointerId,M.setPointerCapture(N),P(j),j.preventDefault()}),M.addEventListener("pointermove",j=>{j.pointerId===N&&P(j)});let $=j=>{j.pointerId===N&&(N=null,y.joy.x=y.joy.y=0,L.style.transform="")};M.addEventListener("pointerup",$),M.addEventListener("pointercancel",$)}function Vt(M){let L=y.keys,N=(L.KeyW||L.ArrowUp?1:0)-(L.KeyS||L.ArrowDown?1:0)-y.joy.y,P=(L.KeyD||L.ArrowRight?1:0)-(L.KeyA||L.ArrowLeft?1:0)+y.joy.x;L.KeyQ&&(y.yaw+=M*1.8),L.KeyE&&(y.yaw-=M*1.8);let $=Math.hypot(N,P);if($>.05){let j=(L.ShiftLeft||L.ShiftRight?5.2:2.6)*M*Math.min(1,$)/$,vt=Math.sin(y.yaw),Ut=Math.cos(y.yaw),Xt=y.fpPos.x+(vt*N-Ut*P)*j,Ct=y.fpPos.z+(Ut*N+vt*P)*j,me=.3,Re=(dn,fn)=>{if(dn<ft.x1-14||dn>ft.x2+14||fn<ft.z1-12||fn>ft.z2+12)return!0;for(let on of d.obstacles)if(!(on.h<.5)&&dn>on.x1-me&&dn<on.x2+me&&fn>on.z1-me&&fn<on.z2+me)return!0;return!1};Re(Xt,y.fpPos.z)||(y.fpPos.x=Xt),Re(y.fpPos.x,Ct)||(y.fpPos.z=Ct)}l.position.copy(y.fpPos),l.rotation.set(y.pitch,y.yaw+Math.PI,0,"YXZ")}let Gt=new ra,Zt=new yt,fe=(M,L)=>{y.mode==="fpv"&&y.locked?Zt.set(0,0):Zt.set(M/window.innerWidth*2-1,-(L/window.innerHeight)*2+1),Gt.setFromCamera(Zt,l);let N=Gt.intersectObjects(p.agents.map($=>$.proxy),!1)[0],P=Gt.intersectObjects(d.screens.map($=>$.mesh),!1)[0];return N&&(!P||N.distance<=P.distance+.4)?{agent:N.object.userData.agent}:P&&P.face&&P.face.normal.clone().transformDirection(P.object.matrixWorld).dot(Gt.ray.direction)<0?{screen:P.object.userData.screenInfo}:null};t.addEventListener("pointerup",M=>{if(!mt||mt.moved>6){mt=null;return}if(mt=null,y.mode==="cctv"||y.mode==="tour"||y.mode==="cine")return;let L=fe(M.clientX,M.clientY);L&&L.agent?F.select(L.agent):L&&L.screen?F.pip(L.screen):(y.mode==="overview"||y.mode==="maquete")&&F.select(null)});let Dt=new Ha,pe=()=>document.querySelectorAll(".pop").forEach(M=>M.classList.remove("show")),F=Hv({sim:p,st:y,config:Yr,setMode:st,flyTo:K,camera:l,orbit:w,HOME:S,world:d,audio:Dt,setTime:rt,setQuality:A,closePops:pe,CAMS:It,day:W});p.onStatus=M=>F.status(M),p.onSay=(M,L,N)=>F.say(M,N);let Ie=At("#labels"),Rt=new I;for(let M of p.agents){let L=document.createElement("button");L.className="tag",L.style.setProperty("--c",M.def.color),L.innerHTML='<i></i><b></b><span></span><div class="say"></div>',L.querySelector("b").textContent=M.def.kind==="president"?`${M.def.name} \xB7 ${M.def.role}`:M.def.name,M.def.kind==="president"&&L.classList.add("boss"),L.addEventListener("click",()=>F.select(M)),Ie.appendChild(L),M.tag=L,M.tagIcon=L.querySelector("span"),M.tagSay=L.querySelector(".say")}let Jt=Object.entries(Ua).map(([M,L])=>{let N=document.createElement("div");return N.className="room",N.innerHTML=`<i style="background:#${L.accent.toString(16).padStart(6,"0")}"></i>${L.name}`,Ie.appendChild(N),{el:N,pos:new I((L.x1+L.x2)/2,.02,L.z1<0?L.z2-.35:L.z2-.45)}}),C=d.obstacles.filter(M=>M.wall&&!M.glass&&M.h>2.2);function z(M,L){let N=L.x-M.x,P=L.z-M.z;for(let $ of C){let j=0,vt=1,Ut=!0;for(let[Xt,Ct,me,Re]of[[M.x,N,$.x1,$.x2],[M.z,P,$.z1,$.z2]])if(Math.abs(Ct)<1e-9){if(Xt<me||Xt>Re){Ut=!1;break}}else{let dn=(me-Xt)/Ct,fn=(Re-Xt)/Ct;if(dn>fn&&([dn,fn]=[fn,dn]),j=Math.max(j,dn),vt=Math.min(vt,fn),j>vt){Ut=!1;break}}if(Ut)return!0}return!1}function k(M){let L=window.innerWidth,N=window.innerHeight,P=l.position.y<he+.3,$=y.labels&&y.mode!=="cctv";for(let j of p.agents){Rt.copy(j.headPos),Rt.y+=.3;let vt=Rt.distanceTo(l.position);Rt.project(l);let Ut=$&&Rt.z<1&&Rt.z>-1&&Math.abs(Rt.x)<1.05&&Math.abs(Rt.y)<1.05&&(!P||vt<16)&&vt>.9,Xt=j.tag;if(!Ut){Xt.style.display!=="none"&&(Xt.style.display="none");continue}Xt.style.display="",Xt.style.transform=`translate(-50%,-100%) translate(${((Rt.x*.5+.5)*L).toFixed(1)}px,${((-Rt.y*.5+.5)*N).toFixed(1)}px)`,Xt.style.zIndex=String(1e5-Math.round(vt*100));let Ct=!P&&vt>(y.mode==="maquete"?190:46);Xt.classList.toggle("sel",y.selected===j),Xt.classList.toggle("far",Ct),Xt.classList.toggle("dim",P&&z(l.position,j.headPos)),Xt.classList.toggle("busy",j.state!=="seated"||j.busy||!!j.conv),j.tagIcon.textContent!==j.status.icon&&(j.tagIcon.textContent=j.status.icon);let me=j.bubble;if(me){let Re=Math.min(me.text.length,Math.floor((M-me.t0)*42));Re!==me.k&&(me.k=Re,j.tagSay.textContent=me.text.slice(0,Re),j.tagSay.classList.add("on"),j.tagSay.classList.toggle("done",Re>=me.text.length)),(M>me.t0+me.dur||Ct)&&(j.tagSay.classList.remove("on"),j.bubble=null)}}for(let j of Jt){if(Rt.copy(j.pos).project(l),!($&&!P&&y.mode!=="maquete"&&Rt.z<1&&Math.abs(Rt.x)<1&&Math.abs(Rt.y)<1&&l.position.distanceTo(j.pos)<75)){j.el.style.display!=="none"&&(j.el.style.display="none");continue}j.el.style.display="",j.el.style.transform=`translate(-50%,-50%) translate(${((Rt.x*.5+.5)*L).toFixed(1)}px,${((-Rt.y*.5+.5)*N).toFixed(1)}px)`}}let v={},_=new I;function U(M,L){let N=l.position,P=N.y<he+.35;if(P)v.N=v.S=v.E=v.W=v.P=v.G=50;else{l.getWorldDirection(_);let $=Math.hypot(_.x,_.z)||1,j=Math.atan2(-_.y,$),vt=.32,Ut=y.mode==="maquete"?9:1.5;v.S=N.z>ft.z2-Ut?vt:50,v.N=N.z<ft.z1+Ut?vt:50,v.E=N.x>ft.x2-Ut?vt:50,v.W=N.x<ft.x1+Ut?vt:50;let Xt=Math.abs(_.x)/$;v.P=Xt>.6&&j<1.1?1.15:50,v.G=j<.5&&Xt<.75?1.15:50}d.setCut(v,M,L),d.ceiling.visible=P,d.backdrop&&(d.backdrop.visible=P)}let B=new ia,H=new I,Y=new I,pt=new I,ot=new I,at=0,Mt=0,lt=0,gt=0,ut=["vendas","mercado","criativo","ti","financeiro","julia","vitoria","claudia","maria"].map(M=>p.byId.get(M)).filter(Boolean);function Tt(){Kd(d.videoWall.canvas,p.time,ut.map(M=>({label:M.def.name,color:M.def.color,busy:M.state!=="seated"||M.busy,status:M.status.text}))),d.videoWall.tex.needsUpdate=!0}function dt(M){let L=Math.min(.05,M);y.time+=L,D(M),p.update(L),d.update(p.time,L);let N=l.position.y<he+.3&&y.mode!=="tour"&&y.mode!=="cctv";for(let P of p.agents){P.proxy.position.set(P.pos.x,.9,P.pos.z);let $=N?Math.hypot(l.position.x-P.pos.x,l.position.z-P.pos.z):99;P.lookCam=$<3.4&&$>.5&&(y.mode!=="follow"||P!==y.follow)&&P.curRole!=="walk"?l.position:null}(at-=L)<=0&&(at=.25,Tt(),F.pipTick());{let P=Z(),$=(P-W.hour+36)%24-12;Math.abs($)<.01?W.hour=P:W.hour=(W.hour+Math.sign($)*Math.min(Math.abs($),L*7)+24)%24,J(Mt<2)}if(y.mode==="overview"||y.mode==="maquete")if(y.intro){let P=y.intro;P.t+=L;let $=Math.max(0,Math.min(1,P.t/P.dur)),j=$*$*$*($*($*6-15)+10);l.position.lerpVectors(P.p0,S.pos,j),w.target.lerpVectors(P.t0,S.target,j),l.lookAt(w.target),$>=1&&(y.intro=null,w.enabled=!0)}else if(y.flight){let P=y.flight;P.t+=L;let $=Math.min(1,P.t/P.dur),j=$*$*(3-2*$);l.position.lerpVectors(P.p0,P.p1,j),w.target.lerpVectors(P.t0,P.t1,j),l.lookAt(w.target),$>=1&&(y.flight=null)}else w.update();else if(y.mode==="fpv")Vt(L);else if(y.mode==="tour")y.tourT+=L,_t(y.tourT,H,Y),l.position.copy(H),l.lookAt(Y);else if(y.mode==="cctv"){y.camT+=L,y.camAuto&&y.camT>9&&F.cam(1,!0);let P=It[y.cam];l.position.set(...P[1]);let $=Math.sin(y.camT*.35)*.9;Y.set(P[2][0]+$*(Math.abs(P[1][0]-P[2][0])>Math.abs(P[1][2]-P[2][2])?0:1),P[2][1],P[2][2]+$*(Math.abs(P[1][0]-P[2][0])>Math.abs(P[1][2]-P[2][2])?1:0)),l.lookAt(Y)}else if(y.mode==="cine"){let P=y.cine,$=p.byId.get("thiago");P.t+=L;let j=p.meeting;if(!j&&P.t>3)st("overview",{home:!0});else{if(j&&j.start!==null&&P.phase===0&&(P.phase=1,P.a=-.55),P.phase===0)H.set($.pos.x+5.5,7.4,$.pos.z+8.2),Y.set($.pos.x+.6,1.1,$.pos.z-.4);else{P.a+=L*.085;let Xt=11.5;H.set(6.5+Math.sin(P.a)*Xt,8.6,-5.1+Math.cos(P.a)*Xt),Y.set(6.5,.9,-5.3)}let Ut=1-Math.exp(-L*(P.t<.2?60:1.6));l.position.lerp(H,Ut),P.look.lerp(Y,Ut),l.lookAt(P.look)}}else if(y.mode==="follow"&&y.follow){let P=y.follow,$=P.headPos,j=2.6,vt=null;for(let Xt of[0,.9,-.9,1.8,-1.8,Math.PI]){let Ct=P.yaw+Math.PI+Xt;if(H.set($.x+Math.sin(Ct)*j,0,$.z+Math.cos(Ct)*j),!(H.x<ft.x1+.3||H.x>ft.x2-.3||H.z<ft.z1+.3||H.z>ft.z2-.3)&&!z($,H)){vt=Ct;break}}vt===null&&(vt=P.yaw+Math.PI);let Ut=y.followYaw===void 0;if(Ut)y.followYaw=vt;else{let Xt=(vt-y.followYaw+Math.PI*3)%(Math.PI*2)-Math.PI;y.followYaw+=Xt*Math.min(1,L*1.8)}H.set($.x+Math.sin(y.followYaw)*j,Math.min(he-.35,$.y+.42),$.z+Math.cos(y.followYaw)*j),Ut?l.position.copy(H):l.position.lerp(H,1-Math.exp(-L*4)),Y.set($.x,$.y-.08,$.z),l.lookAt(Y)}if(y.selected){let P=y.selected;m.visible=!0,m.position.set(P.pos.x,.03,P.pos.z);let $=1+Math.sin(y.time*4)*.05;m.scale.set($,$,$)}else m.visible=!1;if(U(L,Mt<2||y.instant),l.updateMatrixWorld(),!y.noRender)if(y.post){let P=.5;y.mode==="maquete"&&(Rt.copy(w.target).project(l),P=Rt.y*.5+.5);let $=W.s.night;R.render(n,l,{exposure:W.exposure,bloom:$?.85:.5,tilt:y.mode==="maquete"?.0115:0,focus:P,cctv:y.mode==="cctv",time:y.time,sat:y.mode==="maquete"?1.2:1.06,vignette:y.mode==="maquete"?.32:.2,aoStrength:.9})}else e.setRenderTarget(null),e.render(n,l);if(Dt.on){if(l.getWorldDirection(ot),y.mode==="overview"||y.mode==="maquete"||y.mode==="cine"){let P=l.position.distanceTo(w.target);pt.copy(y.mode==="cine"?y.cine.look:w.target).addScaledVector(ot,-Math.min(7,P*(y.mode==="maquete"?.05:.2))),pt.y=Math.max(1.6,pt.y)}else pt.copy(l.position);Dt.update(L,{listener:pt,forward:ot,up:l.up,sim:p,world:d})}k(y.time),F.tick(L),(gt-=L)<=0&&(gt=.1,F.mini()),Mt++}e.setAnimationLoop(()=>dt(B.getDelta())),window.addEventListener("resize",()=>{if(V(),y.mode==="overview"&&(w.maxDistance=85*S.k),l.aspect=window.innerWidth/window.innerHeight,Qt(),l.updateProjectionMatrix(),e.setSize(window.innerWidth,window.innerHeight),R){let M=e.getDrawingBufferSize(new yt);R.setSize(M.x,M.y)}});let zt=new Set;function Bt(M){if(!M||typeof M!="object")return;let L=M.type||M.tipo;if(L==="pedido"){d.print(),Dt.printer(2.4,.8,-5.6),Dt.chime();let N=p.byId.get(M.agente||"julia")||p.byId.get("vendas"),P=String(M.titulo||M.title||"novo pedido").slice(0,60);p.celebrate(N),F.say(N,`Novo pedido: ${P}`,!0),F.toast(`${M.teste?"Teste \xB7 ":""}Novo pedido: ${P}`)}else if(L==="servidor"){let N=M.status==="ok"?0:Math.max(0,Math.min(1,M.carga!==void 0?(+M.carga-.6)/.35:1));d.serverAlert=N;let P=p.byId.get("ti");N>.4?(F.toast(String(M.texto||"Servidor com carga alta \u2014 TI foi conferir").slice(0,80)),P&&!P.busy&&!P.conv&&P.state==="seated"&&p.errand(P,{spot:"ti.rack",role:"workMid",label:"Conferindo o alerta nos servidores",icon:"\u{1F6A8}",dur:[12,16],go:"Indo conferir os servidores"})):P&&F.say(P,"Servidores normalizados",!0)}else if(L==="mensagem"){let N=p.byId.get(M.agente);N&&M.texto&&F.say(N,String(M.texto).slice(0,90),!0)}}let se=Yr.events||{};if(se.url){let M=async L=>{try{let P=await(await fetch(se.url,{cache:"no-store"})).json();for(let $ of Array.isArray(P)?P:P.events||[]){let j=$.id??JSON.stringify($);zt.has(j)||(zt.add(j),L||Bt($))}}catch{}};M(!0),setInterval(()=>M(!1),Math.max(5,se.intervalo||15)*1e3)}window.addEventListener("message",M=>{M.data&&M.data.office3d&&Bt(M.data.office3d)}),F.onSim=M=>{M==="order"?Bt({type:"pedido",titulo:"pedido de demonstra\xE7\xE3o",teste:!0}):(Bt({type:"servidor",carga:.97,texto:"Teste: carga alta nos servidores \u2014 TI foi conferir"}),setTimeout(()=>Bt({type:"servidor",status:"ok"}),26e3))},window.Office3D={event:Bt,setTime:rt,setMode:st,sim:p},A(Wn.get("q")||Va.get("office3d.q")||(Ii||Math.min(window.innerWidth,window.innerHeight)<600?"low":"high")),rt(W.preset),J(!0),st("overview",{force:!0,home:!0});{Ks(.98,"Preparando a cena\u2026");let M=l.position.clone(),L=l.quaternion.clone(),N=l.fov;try{l.clearViewOffset(),l.fov=70,l.position.set(0,46,.01),l.lookAt(0,0,0),l.updateProjectionMatrix(),l.updateMatrixWorld(),U(0,!0),d.ceiling.visible=!0,d.backdrop&&(d.backdrop.visible=!0);for(let P of p.agents)P.rig.updateMatrixWorld(!0);y.post?R.render(n,l,{exposure:W.exposure}):(e.setRenderTarget(null),e.render(n,l))}catch(P){console.warn("aquecimento",P)}l.position.copy(M),l.quaternion.copy(L),l.fov=N,Qt(),l.updateProjectionMatrix(),l.updateMatrixWorld()}Wn.has("nointro")||(y.intro={p0:new I(-11.9,5.2,4.2),t0:new I(-12.5,1.5,-6.6),t:-.9,dur:5.2},w.enabled=!1,l.position.copy(y.intro.p0),w.target.copy(y.intro.t0),l.lookAt(w.target)),Ks(1,"Pronto"),document.body.classList.add("ready"),setTimeout(()=>{let M=At("#loading");M&&M.remove()},1600),window.__office={sim:p,world:d,nav:f,camera:l,orbit:w,st:y,setMode:st,renderer:e,scene:n,ui:F,HOME:S,frame:dt,day:W,setTime:rt,setQuality:A,audio:Dt,officeEvent:Bt,get post(){return R},ff(M,L=1/30){for(let N=0;N<M;N+=L)p.update(L),d.update(p.time,L)},skip(M,L=1/20){y.noRender=!0;for(let N=0;N<M;N+=L)dt(L);y.noRender=!1},still(M=2){e.setAnimationLoop(null),y.instant=!0;for(let L=0;L<M;L++)dt(1/30)},view(M,L,N){y.intro=null,y.flight=null,w.enabled=!1,y.mode="free",document.body.dataset.mode="free",l.clearViewOffset(),l.position.set(...M),l.lookAt(...L),N&&(l.fov=N),l.updateProjectionMatrix()}}}function Hv({sim:i,st:t,config:e,setMode:n,flyTo:s,camera:r,orbit:o,HOME:a,world:c,audio:h,setTime:l,setQuality:u,closePops:d,CAMS:f,day:p}){let x=At("#team-list"),g=At("#card"),m=new Map;for(let y of i.agents){let R=document.createElement("button");R.className="row",R.innerHTML=`<i style="background:${y.def.color}">${hf(y.def.name)}</i><div><b></b><small></small></div><em></em>`,R.querySelector("b").textContent=y.def.name,R.addEventListener("click",()=>V.select(y,!0)),x.appendChild(R),m.set(y,{el:R,small:R.querySelector("small"),em:R.querySelector("em")})}document.querySelectorAll("[data-mode-btn]").forEach(y=>y.addEventListener("click",()=>{h.ui(),n(y.dataset.modeBtn)}));let w=0,E=0,S=null,V={select(y,R=!1){if(t.selected=y,m.forEach((D,W)=>D.el.classList.toggle("on",W===y)),document.body.classList.toggle("has-card",!!y),!y){g.classList.remove("show");return}h.ui(740),g.classList.add("show"),At("#card-name").textContent=y.def.name,At("#card-role").textContent=y.def.role,At("#card-dept").textContent=y.def.dept,At("#card-desc").textContent=y.def.desc||"",At("#card-avatar").style.background=y.def.color,At("#card-avatar").textContent=hf(y.def.name);let A=At("#card-actions");A.innerHTML="";let b=(D,W,Z)=>{let J=document.createElement("button");J.textContent=D,Z&&(J.className="primary"),J.addEventListener("click",()=>{h.ui(),W()}),A.appendChild(J)};if(b("Seguir com a c\xE2mera",()=>{n("follow",{agent:y,force:!0})},!0),y.def.kind==="president"?(b("Passar nos setores",()=>i.command(y,"visit")),b("Convocar reuni\xE3o geral",()=>V.meeting())):b("Chamar \xE0 Presid\xEAncia",()=>i.command(y,"president")),b("Pausa para o caf\xE9",()=>i.command(y,"coffee")),b("Atender o telefone",()=>i.command(y,"phone")),b("Voltar ao posto",()=>i.command(y,"home")),V.status(y,!0),R&&t.mode==="overview"){let D=new I(y.pos.x,1,y.pos.z),W=r.position.clone().sub(o.target).normalize();s(D.clone().addScaledVector(W,13),D,1.2)}t.mode==="follow"&&(t.follow=y,t.followYaw=void 0)},status(y){let R=m.get(y);if(R&&(R.small.textContent=y.status.text,R.em.textContent=y.status.icon),t.selected===y){At("#card-status").textContent=`${y.status.icon} ${y.status.text}`;let A=At("#card-log");A.innerHTML="";for(let b of y.log.slice(-7).reverse()){let D=document.createElement("div");D.innerHTML=`<time>${b.t}</time>`,D.appendChild(document.createTextNode(b.text)),A.appendChild(D)}y.log.length||(A.innerHTML='<div class="empty">Sem movimenta\xE7\xF5es ainda.</div>')}},say(y,R,A=!1){if(!y||!t.labels)return;let b=i.agents.filter(D=>D.bubble).length;!A&&b>=3&&t.selected!==y||(y.bubble={text:R,t0:t.time,dur:3.2+R.length*.045,k:-1})},meeting(){if(i.meeting){V.toast("A reuni\xE3o geral j\xE1 est\xE1 em andamento.");return}i.startMeeting(),V.toast("Reuni\xE3o geral convocada \u2014 a equipe est\xE1 indo para a sala de reuni\xE3o."),t.cine={t:0,phase:0,a:0,look:new I(0,1,0)},n("cine",{force:!0})},toast(y){let R=At("#toast");R.querySelector("span").textContent=y,R.classList.add("show"),clearTimeout(E),E=setTimeout(()=>R.classList.remove("show"),4600)},toggleLabels(){if(t.labels=!t.labels,At("#opt-labels").classList.toggle("on",t.labels),!t.labels)for(let y of i.agents)y.bubble=null,y.tagSay.classList.remove("on")},toggleSound(){let y=!h.on;if(y){if(!h.enable()){V.toast("Este navegador n\xE3o liberou o \xE1udio.");return}}else h.disable();let R=At("#btn-sound");R.classList.toggle("on",y),R.querySelector(".on").style.display=y?"":"none",R.querySelector(".off").style.display=y?"none":"",y&&(h.ui(),V.toast("Som ambiente ligado \u2014 aproxime a c\xE2mera para ouvir os teclados e os servidores."))},cam(y,R=!1){t.cam=(t.cam+y+f.length)%f.length,t.camT=0,R||(t.camAuto=!1,At("#cctv-auto").textContent="AUTO: DESLIGADO"),At("#cctv-name").textContent=`CAM_${String(t.cam+1).padStart(2,"0")} \u2014 ${f[t.cam][0]}`},pip(y){S=y;let R=y.owner&&i.byId.get(y.owner);At("#pip-title").textContent=y.title||(R?`Tela de ${R.def.name}`:"Tela"),At("#pip-sub").textContent=R?R.def.role:y.live?"ao vivo na simula\xE7\xE3o":"",At("#pip").classList.add("show"),V.pipTick(!0),h.ui(620)},pipTick(y){if(!S||!y&&!S.live||!At("#pip").classList.contains("show"))return;let R=At("#pip-canvas"),A=R.getContext("2d");A.imageSmoothingQuality="high",A.drawImage(S.canvas,0,0,R.width,R.height)},mini(){let y=At("#mini-canvas");if(!y||document.body.classList.contains("mini-off"))return;let R=y.getContext("2d"),A=y.width,b=y.height,D=12,W=A/2,Z=b/2,J=document.body.dataset.day==="night",rt=wt=>W+wt*D,K=wt=>Z+wt*D;R.clearRect(0,0,A,b),R.fillStyle=J?"rgba(255,255,255,0.06)":"rgba(18,22,28,0.05)",R.fillRect(rt(-18),K(-8.5),36*D,17*D);for(let wt of Object.values(c.rooms))R.fillStyle="#"+wt.accent.toString(16).padStart(6,"0")+(J?"3a":"26"),R.fillRect(rt(wt.x1)+1.5,K(wt.z1)+1.5,(wt.x2-wt.x1)*D-3,(wt.z2-wt.z1)*D-3);R.strokeStyle=J?"rgba(255,255,255,0.55)":"rgba(22,24,29,0.6)",R.lineWidth=2.2,R.strokeRect(rt(-18),K(-8.5),36*D,17*D),R.lineWidth=1.4,R.beginPath();for(let wt of[-8,3,10])R.moveTo(rt(wt),K(-8.5)),R.lineTo(rt(wt),K(-1.5));for(let wt of[-11,-5,2,9,14])R.moveTo(rt(wt),K(1.5)),R.lineTo(rt(wt),K(8.5));R.stroke(),R.strokeStyle=J?"rgba(255,255,255,0.28)":"rgba(22,24,29,0.28)",R.setLineDash([5,4]),R.beginPath(),R.moveTo(rt(-18),K(-1.5)),R.lineTo(rt(10),K(-1.5)),R.moveTo(rt(-18),K(1.5)),R.lineTo(rt(14),K(1.5)),R.stroke(),R.setLineDash([]);let ct=r.position.y<c.H+.3,tt=ct?r.position.x:o.target.x,et=ct?r.position.z:o.target.z,_t=r.getWorldDirection(new I),It=Math.atan2(_t.z,_t.x);R.fillStyle=J?"rgba(255,255,255,0.16)":"rgba(237,50,55,0.14)",R.beginPath(),R.moveTo(rt(tt),K(et)),R.arc(rt(tt),K(et),ct?46:60,It-.5,It+.5),R.closePath(),R.fill(),R.fillStyle="#ed3237",R.beginPath(),R.arc(rt(tt),K(et),3.5,0,6.3),R.fill();for(let wt of i.agents){let Qt=t.selected===wt;R.beginPath(),R.arc(rt(wt.pos.x),K(wt.pos.z),Qt?8:5.5,0,6.3),R.fillStyle=wt.def.color,R.fill(),R.lineWidth=Qt?3:1.6,R.strokeStyle=J?"#11141a":"#fff",R.stroke()}},tick(y){if(w-=y,w<=0){w=1;let R=new Date;At("#clock").textContent=R.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}),At("#time-now").textContent=At("#clock").textContent;let A=i.agents.filter(b=>b.state!=="seated"||b.busy).length;At("#stat").textContent=`${i.agents.length-A} no posto \xB7 ${A} em movimento`,t.mode==="cctv"&&(At("#cctv-time").textContent=R.toLocaleDateString("pt-BR")+"  "+R.toLocaleTimeString("pt-BR"))}}},O=(y,R)=>At(y).addEventListener("click",A=>{A.stopPropagation();let b=At(R),D=b.classList.contains("show");if(d(),!D){b.classList.add("show");let W=At(y).getBoundingClientRect();b.style.right=Math.max(10,window.innerWidth-W.right-60)+"px"}h.ui()});O("#btn-time","#pop-time"),O("#btn-more","#pop-more"),document.addEventListener("pointerdown",y=>{!y.target.closest(".pop")&&!y.target.closest("#btn-time")&&!y.target.closest("#btn-more")&&d()}),document.querySelectorAll("[data-time]").forEach(y=>y.addEventListener("click",()=>{l(y.dataset.time),h.ui(),d()})),At("#btn-sound").addEventListener("click",()=>V.toggleSound()),At("#btn-meeting").addEventListener("click",()=>{h.ui(),V.meeting()}),At("#btn-home").addEventListener("click",()=>{i.allHome(),V.toast("Todos voltando aos postos."),d()}),At("#btn-reset").addEventListener("click",()=>{n("overview",{force:!0}),s(a.pos,a.target,1.2),d()}),At("#btn-pres").addEventListener("click",()=>{h.ui(),n("overview",{force:!0}),s(new I(-11.5,6.6,3.4),new I(-12.4,1.4,-6.4),1.6),V.select(i.byId.get("thiago"))}),At("#opt-quality").addEventListener("click",()=>{t.lite=!1,t.perfOff&&t.perfOff(),u(t.quality==="high"?"low":"high"),V.toast(t.quality==="high"?"Qualidade alta: sombras suaves, brilho das telas e mais luzes.":"Qualidade leve: mais r\xE1pida em computadores e celulares modestos.")}),At("#opt-labels").addEventListener("click",()=>V.toggleLabels()),At("#opt-mini").addEventListener("click",()=>{let y=document.body.classList.toggle("mini-off");At("#opt-mini").classList.toggle("on",!y)}),At("#sim-order").addEventListener("click",()=>{V.onSim&&V.onSim("order"),d()}),At("#sim-server").addEventListener("click",()=>{V.onSim&&V.onSim("server"),d()}),At("#card-close").addEventListener("click",()=>V.select(null)),At("#btn-team").addEventListener("click",()=>{document.body.classList.toggle("team-off"),t.applyOffset(),r.updateProjectionMatrix()}),At("#cctv-prev").addEventListener("click",()=>V.cam(-1)),At("#cctv-next").addEventListener("click",()=>V.cam(1)),At("#cctv-auto").addEventListener("click",()=>{t.camAuto=!t.camAuto,At("#cctv-auto").textContent=t.camAuto?"AUTO":"AUTO: DESLIGADO"}),At("#pip-close").addEventListener("click",()=>At("#pip").classList.remove("show")),At("#pip").addEventListener("pointerdown",y=>{y.target.id==="pip"&&At("#pip").classList.remove("show")}),At("#mini-canvas").addEventListener("click",y=>{let R=y.target.getBoundingClientRect(),A=((y.clientX-R.left)/R.width-.5)*(460/12),b=((y.clientY-R.top)/R.height-.5)*(232/12),D=new I(Math.max(-18,Math.min(18,A)),0,Math.max(-8.5,Math.min(8.5,b)));t.mode!=="overview"&&t.mode!=="maquete"&&n("overview",{force:!0});let W=r.position.clone().sub(o.target);s(D.clone().add(W),D,.9)}),V.cam(0,!0);for(let y of i.agents)V.status(y);return V}function hf(i){let t=i.replace(/[^A-Za-zÀ-ÿ. ]/g,"").split(/[ .]+/).filter(Boolean);return((t[0]||"")[0]+((t[1]||"")[0]||"")).toUpperCase()}Bv().catch(i=>{console.error(i);let t=document.querySelector("#load-msg");t&&(t.textContent="N\xE3o foi poss\xEDvel abrir o escrit\xF3rio: "+i.message)});})();
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2024 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
