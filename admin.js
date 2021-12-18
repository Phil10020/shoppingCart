let orderData=[];
const orderList=document.querySelector(".js-orderList");
function init(){
    getOrderList();

}
init();

//C3 LV1
function renderC3(){
    //物件資料蒐集
    let total={};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(total[productItem.category]==undefined){
                total[productItem.category]=productItem.price*productItem.quantity;
            }else{
                total[productItem.category]+=productItem.price*productItem.quantity;
            }
        })   
    })
    //console.log(total);
    //資料關聯
    let categoryAry=Object.keys(total);
    console.log(categoryAry);
    let newData=[];
    categoryAry.forEach(function(item){
        let ary=[];
        ary.push(item);
        ary.push(total[item]);
        newData.push(ary);
    })
    console.log(newData);
    // C3.js
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData,
            
        },
    });
}

//C3 LV2
function renderC3_LV2(){
    let obj ={};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(obj[productItem.title]===undefined){
                obj[productItem.title]=productItem.quantity*productItem.price;
            }else{
                obj[productItem.title]+=productItem.quantity*productItem.price;
            }
        })
    })
    //console.log(obj);
    //拉出資料關聯
    let originAry=Object.keys(obj);
    //console.log(originAry);
    //利用originAry整理成C3格式
    let rankSortAry=[];
    originAry.forEach(function(item){
        let ary=[];
        ary.push(item);
        ary.push(obj[item]);
        rankSortAry.push(ary);
    });
    //console.log(rankSortAry);
    //使用short比較大小，降幕排列
    rankSortAry.sort(function(a,b){
        return b[1]-a[1];
    })
    //超過4筆以上統整為其它
    if(rankSortAry.length>3){
        let otherTotal=0;
        rankSortAry.forEach(function(item,index){
            if(index>2){
                otherTotal+=rankSortAry[index][1];
            }
        })
        rankSortAry.splice(3,rankSortAry.length-1);
        rankSortAry.push(['其它',otherTotal]);
    }
    //C3圖表
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: rankSortAry,
            
        },
    });
    
}

function getOrderList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(res){
        orderData=res.data.orders;
        let str="";
        orderData.forEach(function(item){
            //組時間字串
            const timeStemp=new Date(item.createdAt*1000);//必須為13碼所以要*1000
            const orderTime=`${timeStemp.getFullYear()}/${timeStemp.getMonth()+1}/${timeStemp.getDate()}`;
            //console.log(orderTime);
            //組產品字串
            let productStr="";
            item.products.forEach(function(productItem){
                productStr+=`
                <p>${productItem.title}x${productItem.quantity}</p>
                `
            })
            //判斷訂單處理狀態
            let orderStatus="";
            if(item.paid==true){
                orderStatus="已處理"
            }else{
                orderStatus="未處理"
            }
            //訂單字串
            str+=`
            <tr>
                        <td>${item.id}</td>
                        <td>
                          <p>${item.user.name}</p>
                          <p>${item.user.tel}</p>
                        </td>
                        <td>${item.user.address}</td>
                        <td>${item.user.email}</td>
                        <td>
                          ${productStr}
                        </td>
                        <td>${orderTime}</td>
                        <td class="js-orderStatus">
                          <a href="#" data-status="${item.paid}" class="orderStatus" data-id="${item.id}">${orderStatus}</a>
                        </td>
                        <td>
                          <input type="button" data-id="${item.id}" class="delSingleOrder-Btn js-orderDelete" value="刪除">
                        </td>
                    </tr>
            `
        })
        orderList.innerHTML=str;
        renderC3_LV2();
    })
}

orderList.addEventListener("click",function(e){
    e.preventDefault();
    const targetClass=e.target.getAttribute("class");
    let id= e.target.getAttribute("data-id");
    if(targetClass=="delSingleOrder-Btn js-orderDelete"){
        deleteOrderItem(id)
        return;
    }
    if(targetClass=="orderStatus"){
        let status= e.target.getAttribute("data-status");
        
        changeOrderStatus(status,id);
        return;
    }

})

function changeOrderStatus(status,id){
    console.log(status,id);
    let newStatus;
    //state 型別是字串，而根據 API 文件，請求需要的資料 paid 型別需為布林值
//所以判斷是否等於 "true"、"false"，再將 paidState 賦值 true、false
    if(status==="true"){
        newStatus=false;
    }else{
        newStatus=true;
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        "data": {
            "id":id,
            "paid":newStatus
          }
    },{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(reponse){
        alert("修改成功");
        getOrderList();
    })
}

function deleteOrderItem(id){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(res){
        alert("刪除該筆訂單成功");
        getOrderList();
    })
}

const discardAllBtn=document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'Authorization':token,
        }
    })
    .then(function(res){
        alert("刪除全部訂單成功");
        getOrderList();
    })
})