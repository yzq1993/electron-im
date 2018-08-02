export default {
	message:state=>state.message.message,
	messageItem:state=>room_id=>state.message.message.find(v=>v.room_id==room_id),
	friend:state=>state.friend.friend,
	friendGroup:state=>group_id=>state.friend.friend.find(v=>v.group_id==group_id),
	friendItem:state=>uid=>{
		let item
		state.friend.friend.forEach(v=>{
			if(!item){
				item=v.children.find(m=>m.uid==uid)
			}
		})
		return item
	},
	group:state=>state.group.group,
	groupItem:state=>group_id=>state.group.group.find(v=>v.id==group_id),
}