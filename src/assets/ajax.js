import axios from 'axios'
import {Notification} from 'element-ui'
import router from '@/router'
export default (options)=>{
	return new Promise((resolve, reject)=>{
		options.baseURL='https://www.yzqroom.cn/im'
		options.withCredentials=true
		axios(options).then(res=>{
			if(res.status>400||res.data.code>400){
				Notification({
					type:'error',
					message:'程序异常',
					duration:1500
				})
				return false
			}
			if(res.data.code==203){
				router.push('/login')
				return false
			}
			if(res.data.code==400){
				Notification({
					type:'error',
					message:res.data.error,
					duration:1500
				})
				reject()
				return false
			}
			resolve(res.data.data||res)
		})
	})
}
