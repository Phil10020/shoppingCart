const productList=document.querySelector(".productWrap");
const productSelect=document.querySelector(".productSelect");
const cartList =document.querySelector(".shoppingCart-tableList");

let productData=[];
let cartData=[];

function init(){
  getProductList();
  getCartList();
}
init();

//商品資料庫
function getProductList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products
  `).then(function(res){
    productData=res.data.products ;
    renderProductList();
    
  })
}

//組合列表+篩選
function combineProductHTMLItem(item){
  return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="${item.description}">
    <a href="#" class="addCardBtn js-addCart" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${item.origin_price}</del>
    <p class="nowPrice">NT$${item.price}</p>
    </li>`
}

//產生商品列表
function renderProductList(){
  let str=``;
    productData.forEach(function(item){
      str+=combineProductHTMLItem(item);
    })
    productList.innerHTML=str ;
}

//商品篩選
productSelect.addEventListener("change",function(e){
  const category=e.target.value;
  if(category=="全部"){
    renderProductList();
    return;
  }
  let str="" ;
  productData.forEach(function(item){
    if(item.category==category){
      str+=combineProductHTMLItem(item);
    }
  })
  productList.innerHTML=str;

})

//找到商品ID並加入購物車
productList.addEventListener("click",function(e){
  e.preventDefault();
  let addCartClass=e.target.getAttribute("class");
  if(addCartClass!=="addCardBtn js-addCart"){
    return;
  }
  let productId=e.target.getAttribute("data-id");
  console.log(productId);

  let numCheck=1;
  cartData.forEach(function(item){
    if(item.product.id===productId){
      numCheck=item.quantity+=1;
    }
  })
  //console.log(numCheck)
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
    "data": {
      "productId": productId,
      "quantity": numCheck
    }
  }).then(function(res){
    //console.log(res);
    alert(`已加入購物車`);
    getCartList();
  })
})


//渲染購物車
function getCartList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
  .then(function(res){
    //總金額
    //console.log(res.data.finalTotal);
    document.querySelector(".js-total").textContent=
    res.data.finalTotal;
    //
    cartData=res.data.carts;
    let str="";
    cartData.forEach(function(item){
      str+=`
      <tr>
        <td>
            <div class="cardItem-title">
                <img src="${item.product.images}" alt="">
                <p>${item.product.title}</p>
            </div>
        </td>
        <td>NT${item.product.price}</td>
        <td>${item.quantity}</td>
        <td>NT$${item.product.price*item.quantity}</td>
        <td class="discardBtn">
            <a href="#" class="material-icons" data-id="${item.id}">
                clear
            </a>
        </td>
    </tr>
      `
    });
    
    cartList.innerHTML=str;
  })
}

//刪除單一品項.
cartList.addEventListener("click",function(e){
  e.preventDefault();
  const cartId=e.target.getAttribute("data-id");
  if(cartId==null){
    alert("null");
    return;
  }
  console.log(cartId);
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`).then(function(res){
    alert(`刪除成功`);
    getCartList();
  })
})

//刪除全部
const discardAllBtn=document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
  .then(function(res){
    alert(`全部刪除成功!`);
    getCartList();
  })
  .catch(function(res){
    alert("購物車已清空,請勿點擊");
  })
  
})

//送出訂單
const orderInfoBtn=document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener("click",function(e){
  e.preventDefault();
  if(cartData.length==0){
    alert("請加入購物車");
    return;
  }
  const customerName=document.querySelector("#customerName").value;
  const customerPhone=document.querySelector("#customerPhone").value;
  const customerEmail=document.querySelector("#customerEmail").value;
  const customerAddress=document.querySelector("#customerAddress").value;
  const customerTradeWay=document.querySelector("#tradeWay").value;
  //console.log(customerName,customerPhone,customerEmail,customerAddress,customerTradeWay)
  
  if(customerName==""||customerPhone==""||customerEmail==""||customerAddress==""||customerTradeWay==""){
    alert("請勿輸入空白資訊");
  return;
  }
  if (validateEmail(customerEmail)==false){
    alert(`請輸入正確mail格式`);
    return;
  }
  
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": customerTradeWay
      }
    }
  }).then(function(res){
    alert("訂單建立成功");
    document.querySelector("#customerName").value="";
    document.querySelector("#customerPhone").value="";
    document.querySelector("#customerEmail").value="";
    document.querySelector("#customerAddress").value="";
    document.querySelector("#tradeWay").value="ATM";
    getCartList();
  })
})
//姓名
const customerName=document.querySelector("#customerName");
customerName.addEventListener("blur",function(e){
  if(customerName.value==false){
    document.querySelector(`[data-message="姓名"]`).textContent=`必填`;
    return;
  }else{
    document.querySelector(`[data-message="姓名"]`).textContent=``;
  }
})

//電話
const customerPhone=document.querySelector("#customerPhone");
customerPhone.addEventListener("blur",function(e){
  if(validatePhone(customerPhone.value)==false){
    document.querySelector(`[data-message="電話"]`).textContent=`請填寫正確手機格式`;
    return;
  }else{
    document.querySelector(`[data-message="電話"]`).textContent=``;
  }
})
//電話正規表達式
function validatePhone(customerPhone){
  if(/^[09]{2}\d{8}$/.test(customerPhone)){
    return true;
  }
  return false;
}

//E-mail驗證
const customerEmail=document.querySelector("#customerEmail");
customerEmail.addEventListener("blur",function(e){
  if(validateEmail(customerEmail.value)==false){
    document.querySelector(`[data-message="Email"]`).textContent=`請填寫正確E-mail格式`;
    return;
  }else{
    document.querySelector(`[data-message="Email"]`).textContent=``;
  }
})
//E-mail正規表達式
function validateEmail(mail) 
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return true ;
  }
    return false ;
}






