<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    created(){
    	
    }
  }
</script>

<style>
*{
	padding: 0;
	margin: 0;
	box-sizing: border-box;
  -webkit-tap-highlight-color:transparent
}
html,body,#app{
  height: 100%;
}
body{
  font-size: 14px;
  color: #333;
  font-family: 'Microsoft YaHei','Helvetica','Simsun';
}
[icon]:after{
  content: '';
  background-repeat:  no-repeat;
  background-size: contain;
  width: 20px;height: 20px;
  display: inline-block;
  vertical-align: middle;
}
[icon=message]:after{
  background-image: url(./images/message.png)
}
[icon=friend]:after{
  background-image: url(./images/friend.png)
}
[icon=group]:after{
  background-image: url(./images/group.png)
}
.scrollbar{
  overflow: auto
}
::-webkit-scrollbar{
  width: 4px;
  position: absolute
}
::-webkit-scrollbar-thumb{
  width: 4px;
  background: #ccc;
  border-radius: 2px
}
</style>
