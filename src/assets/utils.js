import Vue from 'vue'
import {Notification} from 'element-ui'
export default ()=>{
	Vue.prototype.$error=(text)=>{
		Notification({
			type:'error',
			message:text,
			duration:1500
		})
	}
	Vue.prototype.$success=(text)=>{
		Notification({
			type:'success',
			message:text,
			duration:1500
		})
	}
	Vue.filter('toFixed',function(value,num){
		return (+value).toFixed(num)
	})
	Vue.filter('nowDate',function(value){
		if(!value){return null}
		let date=new Date(value),
			now=new Date();
		if(date.getFullYear()==now.getFullYear()&&date.getMonth()==now.getMonth()&&date.getDate()==now.getDate()){
			return addZero(date.getHours())+':'+addZero(date.getMinutes())
		}else if(date.getFullYear()==now.getFullYear()){
			return addZero(date.getMonth()+1)+'-'+addZero(date.getDate())
		}else{
			return date.getFullYear()+'/'+addZero(date.getMonth()+1)+'/'+addZero(date.getDate())
		}
	})
	function addZero(v){
		return v<10?'0'+v:v
	}
	Vue.directive('number', {
	  inserted: function (el,binding) {
	  	let val,reg;
	  	let $input=Array.from(el.children).find((e)=>e.tagName=='INPUT');
	  	if(binding.value===undefined){
	  		reg=/^(0|([1-9]\d*))(\.\d*)?$/
	  	}else if(binding.value===0){
	  		reg=/^(0|([1-9]\d*))$/
	  	}else{
	  		reg=new RegExp('^(0|([1-9][0-9]*))(.[0-9]{0,'+binding.value+'})?$')
	  	}
	  	$input.oninput=(e)=>{
	  		val=e.target.value
	  		if(!reg.test(val)){
	  			e.target.value=val.slice(0,val.length-1)
	  		}
	  	}
	  	$input.onchange=(e)=>{
	  		val=e.target.value
	  		if(/\.$/.test(val)){
	  			e.target.value=val.slice(0,val.length-1)
	  		}
	  	}
	  }
	})
}
