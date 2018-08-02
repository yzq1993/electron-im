import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
import message from './modules/message'
import friend from './modules/friend'
import group from './modules/group'
import getters from './getters';
const store = new Vuex.Store({
	modules:{
		message,
		friend,
		group
	},
	getters,
	state:{
		user:{
			show:false,
			top:0,
			left:0,
			uid:null
		},
		owner:{
			uid:null,
			name:null,
			avatar:null,
			summary:null
		}
	},
	mutations:{
		updateUser(state,data){
			state.user=Object.assign({},state.user,data)
		},
		updateOwner(state,data){
			state.owner=Object.assign({},state.owner,data)
		}
	}
})
export default store