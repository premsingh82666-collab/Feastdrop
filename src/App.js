import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://feastdrop-production.up.railway.app/api";

 const restaurants = [
  { id:1, name:"Burger Palace", cuisine:"American", rating:4.8, deliveryTime:"20-30 min", deliveryFee:1.99, image:"🍔", bg:"#FFF3E0", menu:[{id:101,name:"Classic Burger",desc:"Beef patty, lettuce, tomato",price:8.99,emoji:"🍔"},{id:102,name:"BBQ Bacon Burger",desc:"Smoky BBQ sauce, bacon",price:10.99,emoji:"🥓"},{id:103,name:"Fries",desc:"Golden crispy fries",price:3.49,emoji:"🍟"},{id:104,name:"Milkshake",desc:"Vanilla or chocolate",price:4.99,emoji:"🥤"}]},
  { id:2, name:"Pizza Roma", cuisine:"Italian", rating:4.6, deliveryTime:"25-40 min", deliveryFee:2.49, image:"🍕", bg:"#FCE4EC", menu:[{id:201,name:"Margherita",desc:"Tomato, mozzarella, basil",price:11.99,emoji:"🍕"},{id:202,name:"Pepperoni",desc:"Extra pepperoni",price:13.99,emoji:"🍕"},{id:203,name:"Garlic Bread",desc:"Herb butter toast",price:4.49,emoji:"🥖"},{id:204,name:"Tiramisu",desc:"Italian dessert",price:5.99,emoji:"🍰"}]},
  { id:3, name:"Sushi Zen", cuisine:"Japanese", rating:4.9, deliveryTime:"30-45 min", deliveryFee:3.49, image:"🍣", bg:"#E8F5E9", menu:[{id:301,name:"Salmon Roll",desc:"Fresh salmon, avocado",price:12.99,emoji:"🍣"},{id:302,name:"Tuna Sashimi",desc:"6 slices premium tuna",price:14.99,emoji:"🐟"},{id:303,name:"Edamame",desc:"Steamed soybeans",price:3.99,emoji:"🫛"},{id:304,name:"Miso Soup",desc:"Japanese broth",price:2.99,emoji:"🍵"}]},
  { id:4, name:"Spice Garden", cuisine:"Indian", rating:4.7, deliveryTime:"35-50 min", deliveryFee:1.99, image:"🍛", bg:"#FFF8E1", menu:[{id:401,name:"Butter Chicken",desc:"Creamy tomato curry",price:13.99,emoji:"🍛"},{id:402,name:"Paneer Tikka",desc:"Grilled cottage cheese",price:11.99,emoji:"🧀"},{id:403,name:"Garlic Naan",desc:"Tandoor bread",price:3.99,emoji:"🫓"},{id:404,name:"Mango Lassi",desc:"Sweet yogurt drink",price:3.49,emoji:"🥭"}]}
];

const COUPONS = {WELCOME:0, SAVE10:10, FEAST20:20};
const steps = [{l:"Confirmed",i:"✅"},{l:"Preparing",i:"👨‍🍳"},{l:"On the way",i:"🛵"},{l:"Delivered",i:"🎉"}];

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPass, setSignupPass] = useState("");
  const [authError, setAuthError] = useState("");
  const [selRest, setSelRest] = useState(null);
const [tab, setTab] = useState("menu");
useEffect(() => {
  const savedUser = localStorage.getItem("user");

  if (savedUser) {
    setUser(JSON.parse(savedUser));
    setScreen("home");
  }
}, []);

async function handleLogin() {
  try {
    const r = await axios.post(API + "/login", {
      email: loginEmail,
      password: loginPass
    });

    setUser(r.data.user);
    localStorage.setItem("user", JSON.stringify(r.data.user));
    setScreen("home");
    setAuthError("");
  } catch (e) {
    setAuthError(e.response?.data?.error || "Login failed");
  }
}

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
        setUser(JSON.parse(savedUser));
        setScreen("home");
    }
}, []);
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [couponErr, setCouponErr] = useState("");
  const [trackStep, setTrackStep] = useState(0);
  const [search, setSearch] = useState("");

  const cartCount = cart.reduce((s,i)=>s+i.qty,0);
  const cartTotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const discount = couponDiscount!==null ? cartTotal*couponDiscount/100 : 0;
  const delivFee = cart.length>0 ? cart[0].deliveryFee : 0;
  const grandTotal = cartTotal - discount + delivFee + 0.99;
  async function handleSignup() {
    try {
    const r = await axios.post(API+"/register", {
      name: signupName,
      email: signupEmail,
      password: signupPass
    });

    setUser(r.data.user);
    localStorage.setItem("user", JSON.stringify(r.data.user));
    setScreen("home");
    setAuthError("");
  } catch (e) {
    setAuthError(e.response?.data?.error || "Signup failed");
  }
  }   

  function addToCart(item,rest){
    setCart(prev=>{
      const ex=prev.find(c=>c.id===item.id);
      if(ex) return prev.map(c=>c.id===item.id?{...c,qty:c.qty+1}:c);
      return [...prev,{...item,qty:1,restaurantName:rest.name,deliveryFee:rest.deliveryFee}];
    });
  }

  function removeFromCart(id){
    setCart(prev=>{
      const ex=prev.find(c=>c.id===id);
      if(ex?.qty===1) return prev.filter(c=>c.id!==id);
      return prev.map(c=>c.id===id?{...c,qty:c.qty-1}:c);
    });
  }

  function applyCoupon(){
    const code=coupon.trim().toUpperCase();
    if(code in COUPONS){setCouponDiscount(COUPONS[code]);setCouponErr("");}
    else{setCouponErr("Invalid code");setCouponDiscount(null);}
  }

  async function placeOrder(){
    try{
      await axios.post(API+"/orders",{cart,total:grandTotal,address:"Home",userId:user?.id});
    }catch(e){}
    setScreen("tracking"); setTrackStep(0);
    let s=0;
    const iv=setInterval(()=>{s++;setTrackStep(s);if(s>=3)clearInterval(iv);},2500);
  }

  const S={
    app:{fontFamily:"'Segoe UI',sans-serif",maxWidth:430,margin:"0 auto",minHeight:"100vh",background:"#F7F7F8"},
    header:{background:"#FF4B2B",padding:"18px 20px 14px",color:"#fff"},
    btn:{background:"#FF4B2B",color:"#fff",border:"none",borderRadius:12,width:"100%",padding:"14px",fontSize:16,fontWeight:700,cursor:"pointer"},
    input:{width:"100%",borderRadius:10,border:"1.5px solid #eee",padding:"12px 14px",fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10},
    card:{background:"#fff",borderRadius:16,marginBottom:14,overflow:"hidden",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",cursor:"pointer"},
    body:{padding:"16px 16px 100px"},
    backBtn:{background:"none",border:"none",color:"#fff",fontSize:22,cursor:"pointer",padding:0},
    qtyBtn:{background:"#FF4B2B",color:"#fff",border:"none",borderRadius:6,width:26,height:26,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
    bottomBar:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #eee",padding:"12px 16px 20px"},
    navBar:{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"#fff",borderTop:"1px solid #eee",display:"flex",justifyContent:"space-around",padding:"10px 0 18px",zIndex:100},
  };

  const getQty=id=>cart.find(c=>c.id===id)?.qty||0;
  const filtered=restaurants.filter(r=>r.name.toLowerCase().includes(search.toLowerCase())||r.cuisine.toLowerCase().includes(search.toLowerCase()));

  if(screen==="login"||screen==="signup") return (
    <div style={S.app}>
      <div style={{background:"linear-gradient(160deg,#FF4B2B,#FF8C42)",minHeight:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px 30px"}}>
        <div style={{fontSize:52,marginBottom:8}}>🍽️</div>
        <div style={{color:"#fff",fontSize:26,fontWeight:900}}>FeastDrop</div>
        <div style={{color:"rgba(255,255,255,0.8)",fontSize:13,marginTop:4}}>Delicious food, fast delivery</div>
      </div>
      <div style={{padding:"28px 24px"}}>
        <div style={{display:"flex",background:"#f0f0f0",borderRadius:12,padding:4,marginBottom:24}}>
          {["login","signup"].map(m=>(
            <button key={m} onClick={()=>{setScreen(m);setAuthError("");}} style={{flex:1,padding:"10px",borderRadius:10,border:"none",fontWeight:700,fontSize:14,cursor:"pointer",background:screen===m?"#fff":"transparent",color:screen===m?"#FF4B2B":"#888"}}>
              {m==="login"?"Log In":"Sign Up"}
            </button>
          ))}
        </div>
        {screen==="login"?(
          <>
            <input style={S.input} placeholder="Email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)}/>
            <input style={S.input} type="password" placeholder="Password" value={loginPass} onChange={e=>setLoginPass(e.target.value)}/>
            {authError&&<div style={{color:"#FF4B2B",fontSize:13,marginBottom:10}}>{authError}</div>}
            <button style={S.btn} onClick={()=>setScreen("home")}>Log In</button>
          </>
        ):(
          <>
            <input style={S.input} placeholder="Full name" value={signupName} onChange={e=>setSignupName(e.target.value)}/>
            <input style={S.input} placeholder="Email" value={signupEmail} onChange={e=>setSignupEmail(e.target.value)}/>
            <input style={S.input} type="password" placeholder="Password" value={signupPass} onChange={e=>setSignupPass(e.target.value)}/>
            {authError&&<div style={{color:"#FF4B2B",fontSize:13,marginBottom:10}}>{authError}</div>}
            <button style={S.btn} onClick={handleSignup}>Create Account</button>
          </>
        )}
      </div>
    </div>
  );

  if(screen==="home") return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:12,opacity:0.8}}>Deliver to</div><div style={{fontWeight:700,fontSize:15}}>📍 Current Location</div></div>
          <button style={{background:"#fff",border:"none",borderRadius:20,padding:"6px 14px",display:"flex",alignItems:"center",gap:6,fontWeight:700,color:"#FF4B2B",cursor:"pointer",fontSize:14}} onClick={()=>setScreen("cart")}>
            🛒 {cartCount>0&&<span style={{background:"#FF4B2B",color:"#fff",borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800}}>{cartCount}</span>}
          </button>
        </div>
        <div style={{background:"rgba(255,255,255,0.2)",borderRadius:10,padding:"8px 14px",marginTop:12,display:"flex",gap:8}}>
          <span>🔍</span>
          <input style={{background:"transparent",border:"none",outline:"none",color:"#fff",fontSize:14,width:"100%"}} placeholder="Search restaurants..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>
      <div style={S.body}>
        <div style={{background:"linear-gradient(120deg,#FF4B2B,#FF8C42)",borderRadius:16,padding:"18px 20px",marginBottom:20,color:"#fff"}}>
          <div style={{fontSize:11,fontWeight:700,opacity:0.85,marginBottom:4}}>LIMITED TIME</div>
          <div style={{fontSize:20,fontWeight:900}}>Free delivery on your first order 🎉</div>
          <div style={{fontSize:12,marginTop:8,opacity:0.85}}>Code: <strong>WELCOME</strong></div>
        </div>
        <div style={{fontSize:16,fontWeight:700,marginBottom:12}}>Restaurants near you</div>
        {filtered.map(r=>(
          <div key={r.id} style={S.card} onClick={()=>{setSelRest(r);setTab("menu");setScreen("restaurant");}}>
            <div style={{height:80,background:r.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:50}}>{r.image}</div>
            <div style={{padding:"12px 14px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{fontWeight:700,fontSize:16}}>{r.name}</div>
                <div style={{fontWeight:700,fontSize:13,color:"#FF4B2B"}}>⭐ {r.rating}</div>
              </div>
              <div style={{display:"flex",gap:12,marginTop:6,fontSize:12,color:"#888"}}>
                <span>{r.cuisine}</span><span>🕐 {r.deliveryTime}</span><span>🛵 ${r.deliveryFee}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={S.navBar}>
        {[{i:"🏠",l:"Home",s:"home"},{i:"🛒",l:"Cart",s:"cart"},{i:"👤",l:"Profile",s:"profile"}].map(n=>(
          <button key={n.s} onClick={()=>setScreen(n.s)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,fontSize:10,fontWeight:600,cursor:"pointer",border:"none",background:"none",color:screen===n.s?"#FF4B2B":"#aaa",padding:"4px 16px"}}>
            <span style={{fontSize:22}}>{n.i}</span>{n.l}
          </button>
        ))}
      </div>
    </div>
  );

  if(screen==="restaurant"&&selRest) return (
    <div style={S.app}>
      <div style={{...S.header,paddingBottom:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button style={S.backBtn} onClick={()=>setScreen("home")}>←</button>
          <div style={{fontSize:18,fontWeight:800}}>{selRest.name}</div>
          <button style={{background:"#fff",border:"none",borderRadius:20,padding:"6px 12px",fontWeight:700,color:"#FF4B2B",cursor:"pointer",fontSize:13}} onClick={()=>setScreen("cart")}>🛒 {cartCount>0&&cartCount}</button>
        </div>
        <div style={{display:"flex",marginTop:14}}>
          {["menu","reviews"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"10px",border:"none",background:"none",color:tab===t?"#fff":"rgba(255,255,255,0.6)",fontWeight:700,fontSize:14,cursor:"pointer",borderBottom:tab===t?"3px solid #fff":"3px solid transparent"}}>
              {t==="menu"?"🍽 Menu":"⭐ Reviews"}
            </button>
          ))}
        </div>
      </div>
      <div style={S.body}>
        {tab==="menu"?(
          selRest.menu.map(item=>{
            const qty=getQty(item.id);
            return (
              <div key={item.id} style={{background:"#fff",borderRadius:14,padding:14,marginBottom:10,display:"flex",alignItems:"center",boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
                <div style={{fontSize:30,marginRight:10}}>{item.emoji}</div>
                <div style={{flex:1,marginRight:12}}>
                  <div style={{fontWeight:600,fontSize:15}}>{item.name}</div>
                  <div style={{fontSize:12,color:"#999",marginTop:2}}>{item.desc}</div>
                  <div style={{fontWeight:700,color:"#FF4B2B",fontSize:15,marginTop:4}}>${item.price.toFixed(2)}</div>
                </div>
                {qty===0?(
                  <button style={{background:"#FF4B2B",color:"#fff",border:"none",borderRadius:8,width:30,height:30,fontSize:20,cursor:"pointer"}} onClick={()=>addToCart(item,selRest)}>+</button>
                ):(
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <button style={S.qtyBtn} onClick={()=>removeFromCart(item.id)}>−</button>
                    <span style={{fontWeight:700,fontSize:15,minWidth:16,textAlign:"center"}}>{qty}</span>
                    <button style={S.qtyBtn} onClick={()=>addToCart(item,selRest)}>+</button>
                  </div>
                )}
              </div>
            );
          })
        ):(
          <div style={{background:"#fff",borderRadius:14,padding:16,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:12}}>Customer Reviews</div>
            {[{u:"James K.",r:5,c:"Best food ever! Always fresh.",d:"2 days ago"},{u:"Sarah M.",r:5,c:"Amazing quality, fast delivery!",d:"1 week ago"},{u:"Tom R.",r:4,c:"Great taste, will order again.",d:"2 weeks ago"}].map((rv,i)=>(
              <div key={i} style={{borderBottom:i<2?"1px solid #f0f0f0":"none",paddingBottom:12,marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div style={{fontWeight:700,fontSize:14}}>{rv.u}</div>
                  <div style={{fontSize:12,color:"#bbb"}}>{rv.d}</div>
                </div>
                <div style={{color:"#FFB800",fontSize:13,margin:"4px 0"}}>{"★".repeat(rv.r)}</div>
                <div style={{fontSize:13,color:"#555"}}>{rv.c}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {cartCount>0&&(
        <div style={S.bottomBar}>
          <button style={S.btn} onClick={()=>setScreen("cart")}>View Cart · {cartCount} items · ${cartTotal.toFixed(2)}</button>
        </div>
      )}
    </div>
  );

  if(screen==="cart") return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button style={S.backBtn} onClick={()=>setScreen(selRest?"restaurant":"home")}>←</button>
          <div style={{fontSize:20,fontWeight:800}}>Your Cart</div>
          <div style={{width:40}}/>
        </div>
      </div>
      <div style={S.body}>
        {cart.length===0?(
          <div style={{textAlign:"center",paddingTop:60}}>
            <div style={{fontSize:60,marginBottom:16}}>🛒</div>
            <div style={{fontWeight:700,fontSize:18}}>Cart is empty</div>
            <button style={{...S.btn,width:"auto",padding:"12px 28px",marginTop:24}} onClick={()=>setScreen("home")}>Browse Restaurants</button>
          </div>
        ):(
          <>
            {cart.map(item=>(
              <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid #f0f0f0"}}>
                <div style={{flex:1}}><div style={{fontWeight:600,fontSize:15}}>{item.name}</div><div style={{color:"#aaa",fontSize:12}}>${item.price.toFixed(2)} each</div></div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <button style={S.qtyBtn} onClick={()=>removeFromCart(item.id)}>−</button>
                  <span style={{fontWeight:700,fontSize:15,minWidth:16,textAlign:"center"}}>{item.qty}</span>
                  <button style={S.qtyBtn} onClick={()=>addToCart(item,{name:item.restaurantName,deliveryFee:item.deliveryFee})}>+</button>
                </div>
                <div style={{marginLeft:14,fontWeight:700,minWidth:52,textAlign:"right"}}>${(item.price*item.qty).toFixed(2)}</div>
              </div>
            ))}
            <div style={{background:"#fff",borderRadius:14,padding:14,marginTop:16,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>🎟️ Promo Code</div>
              <div style={{display:"flex",gap:8}}>
                <input style={{...S.input,marginBottom:0,flex:1}} placeholder="WELCOME / SAVE10 / FEAST20" value={coupon} onChange={e=>setCoupon(e.target.value)}/>
                <button onClick={applyCoupon} style={{background:"#FF4B2B",color:"#fff",border:"none",borderRadius:10,padding:"0 16px",fontWeight:700,cursor:"pointer"}}>Apply</button>
              </div>
              {couponErr&&<div style={{color:"#FF4B2B",fontSize:12,marginTop:6}}>{couponErr}</div>}
              {couponDiscount!==null&&<div style={{color:"#22c55e",fontSize:12,marginTop:6,fontWeight:600}}>✅ {couponDiscount===0?"Free delivery!":couponDiscount+"% discount applied!"}</div>}
            </div>
            <div style={{background:"#fff",borderRadius:14,padding:"4px 14px 10px",marginTop:12,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
              <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",fontSize:14,color:"#555"}}><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
              {discount>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",fontSize:14,color:"#22c55e"}}><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
              <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",fontSize:14,color:"#555"}}><span>Delivery + Service</span><span>${(delivFee+0.99).toFixed(2)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",fontSize:17,fontWeight:800,borderTop:"1.5px solid #eee",marginTop:4}}><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
            </div>
          </>
        )}
      </div>
      {cart.length>0&&<div style={S.bottomBar}><button style={S.btn} onClick={()=>setScreen("checkout")}>Proceed to Checkout</button></div>}
    </div>
  );

  if(screen==="checkout") return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <button style={S.backBtn} onClick={()=>setScreen("cart")}>←</button>
          <div style={{fontSize:20,fontWeight:800}}>Checkout</div>
          <div style={{width:40}}/>
        </div>
      </div>
      <div style={S.body}>
        <div style={{fontSize:16,fontWeight:700,marginBottom:12}}>Delivery Address</div>
        <input style={S.input} placeholder="Street address"/>
        <input style={S.input} placeholder="City"/>
        <div style={{fontSize:16,fontWeight:700,marginBottom:12,marginTop:4}}>Payment</div>
        <div style={{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 6px rgba(0,0,0,0.05)",marginBottom:12}}>
          {["💳 Credit / Debit Card","🍎 Apple Pay","💵 Cash on Delivery"].map((m,i)=>(
            <label key={m} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:i<2?"1px solid #f0f0f0":"none",cursor:"pointer"}}>
              <input type="radio" name="pay" defaultChecked={i===0} style={{accentColor:"#FF4B2B"}}/>
              <span style={{fontSize:14,fontWeight:500}}>{m}</span>
            </label>
          ))}
        </div>
        <div style={{background:"#fff",borderRadius:12,padding:"10px 14px",boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
          <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",fontSize:14,color:"#555"}}><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
          {discount>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",fontSize:14,color:"#22c55e"}}><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",fontSize:17,fontWeight:800,borderTop:"1.5px solid #eee",marginTop:4}}><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
        </div>
      </div>
      <div style={S.bottomBar}><button style={S.btn} onClick={placeOrder}>Place Order · ${grandTotal.toFixed(2)}</button></div>
    </div>
  );

  if(screen==="tracking") return (
    <div style={S.app}>
      <div style={S.header}><div style={{fontSize:20,fontWeight:800}}>Order Tracking</div></div>
      <div style={S.body}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:60,marginBottom:8}}>{steps[trackStep].i}</div>
          <div style={{fontWeight:800,fontSize:20}}>{steps[trackStep].l}</div>
        </div>
        <div style={{background:"#fff",borderRadius:14,padding:16,boxShadow:"0 1px 6px rgba(0,0,0,0.05)",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",position:"relative"}}>
            <div style={{position:"absolute",top:14,left:"10%",right:"10%",height:3,background:"#f0f0f0",zIndex:0}}>
              <div style={{height:"100%",background:"#FF4B2B",width:`${(trackStep/3)*100}%`,transition:"width 0.5s"}}/>
            </div>
            {steps.map((s,i)=>(
              <div key={s.l} style={{display:"flex",flexDirection:"column",alignItems:"center",zIndex:1,flex:1}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:i<=trackStep?"#FF4B2B":"#f0f0f0",color:i<=trackStep?"#fff":"#aaa",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,marginBottom:6}}>{i<trackStep?"✓":i+1}</div>
                <div style={{fontSize:10,fontWeight:600,color:i<=trackStep?"#FF4B2B":"#aaa",textAlign:"center"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        {trackStep===3&&<button style={S.btn} onClick={()=>{setCart([]);setCouponDiscount(null);setCoupon("");setScreen("home");}}>🏠 Back to Home</button>}
      </div>
    </div>
  );

  if(screen==="profile") return (
    <div style={S.app}>
      <div style={S.header}><div style={{fontSize:20,fontWeight:800}}>My Profile</div></div>
      <div style={S.body}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#FF4B2B,#FF8C42)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 12px"}}>👤</div>
          <div style={{fontWeight:800,fontSize:20}}>{user?.name}</div>
          <div style={{color:"#aaa",fontSize:14}}>{user?.email}</div>
        </div>
        {[{i:"📦",l:"My Orders"},{i:"📍",l:"Saved Addresses"},{i:"💳",l:"Payment Methods"},{i:"🎟️",l:"My Coupons"}].map(item=>(
          <div key={item.l} style={{background:"#fff",borderRadius:14,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:14,boxShadow:"0 1px 6px rgba(0,0,0,0.05)",cursor:"pointer"}}>
            <span style={{fontSize:22}}>{item.i}</span>
            <div style={{flex:1,fontWeight:600,fontSize:15}}>{item.l}</div>
            <span style={{color:"#ccc",fontSize:18}}>›</span>
          </div>
        ))}
        <button style={{...S.btn,background:"#fff",color:"#FF4B2B",border:"1.5px solid #FF4B2B",marginTop:10}} onClick={()=>{setUser(null);setCart([]);setScreen("login");}}>Log Out</button>
      </div>
      <div style={S.navBar}>
        {[{i:"🏠",l:"Home",s:"home"},{i:"🛒",l:"Cart",s:"cart"},{i:"👤",l:"Profile",s:"profile"}].map(n=>(
          <button key={n.s} onClick={()=>setScreen(n.s)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,fontSize:10,fontWeight:600,cursor:"pointer",border:"none",background:"none",color:screen===n.s?"#FF4B2B":"#aaa",padding:"4px 16px"}}>
            <span style={{fontSize:22}}>{n.i}</span>{n.l}
          </button>
        ))}
      </div>
    </div>
  );

}
