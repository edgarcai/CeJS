
/**
 * @name	CeL function for math
 * @fileoverview
 * 本檔案包含了 math 的 functions。
 * @since	
 */

/*
TODO:
大數計算
方程式圖形顯示 by SVG
*/


if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'math';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @_name	_module_
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {

//	requires
if (eval(library_namespace.use_function(
		'data.split_String_to_Object')))
	return;


/**
 * null module constructor
 * @class	math 的 functions
 */
var _// JSDT:_module_
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
_// JSDT:_module_
.prototype = {
};





/*
	Math	---------------------------------------------------------------
*/

/*
//{var v=Math.LN2,d=mutual_division(v),q=rational_approximation(v);alert('值	'+v+'\n序列	'+d+'\n近似值	'+q[0]+' / '+q[1]+'\n約	'+(q=q[0]/q[1])+'\n值-近似	'+(q-=v)+'\n差'+(Math.abs(q=10000*q/v)>1?'萬分之'+q.decp(2)+' ( '+q+' / 10000 )':'億分之'+(q*=10000).decp(2)+' ( '+q+' / 100000000 )'),0,'近似值	'+v);}

//{var d=new Date,a=.142857,b=1000000,i=0,c;for(i=0;i<10000;i++)c=mutual_division(a);alert(c+'\n'+gDate(new Date-d));}
*/

_// JSDT:_module_
.
/**
 * 輾轉相除
 * @param n1	number 1
 * @param n2	number 2
 * @param times	max 次數
 * @return	連分數序列
 */
mutual_division = function(n1, n2, times) {
	var q = [], c;
	if (isNaN(times) || times <= 0)
		times = 40;
	if (!n2 || isNaN(n2))
		n2 = 1;
	if (n1 != Math.floor(n1)) {
		c = n1;
		var i = 9, f = n2;
		while (i--)
			//	整數運算比較快！這樣會造成整數多4%，浮點數多1/3倍的時間，但仍值得。
			if (f *= 10, c *= 10, c === Math.floor(c)) {
				n1 = c, n2 = f;
				break;
			}
	}
	/*
	 while(b&&n--)
	  d.push((a-(c=a%b))/b),a=b,b=c;	//	2.08s@10000	可能因為少設定（=）一次c所以較快。但（若輸入不為整數）不確保d為整數？用Math.floor((a-(c=a%b))/b)可確保，速度與下式一樣快。
	  //d.push(c=Math.floor(a/b)),c=a-b*c,a=b,b=c;	//	2.14s@10000:mutual_division(.142857)
	  //d.push(Math.floor(a/b)),b=a%(c=b),a=c;	//	2.2s@10000
	 //if(n)d.push(0);
	*/

	//	2.4s@10000	可能因為少設定（=）一次c所以較快。但（若輸入不為整數）不確保d為整數？用Math.floor((a-(c=a%b))/b)可確保，速度與下式一樣快。
	while (times--)
		if (n2)
			q.push((n1 - (c = n1 % n2)) / n2), n1 = n2, n2 = c;
		else {
			q.push(arguments.callee.done, n1);
			break;
		}

	//	2.26s@10000
	//while(b&&n--)if(d.push((a-(c=a%b))/b),a=b,!(b=c)){d.push(0);break;}

	//var m=1;c=1;while(m&&n--)d.push(m=++c%2?b?(a-(a%=b))/b:0:a?(b-(b%=a))/a:0);//bug

	return q;
};
_// JSDT:_module_
.
done = -7.2;//''

_// JSDT:_module_
.
/**
 * 取得連分數序列的數值
 * @param sequence	序列
 * @param max_no	取至第 max_no 個
 * @requires	mutual_division.done
 * @return
 * @see
 * var a=continued_fraction([1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]);
 * alert(a+'\n'+a[0]/a[1]+'\n'+Math.SQRT2+'\n'+(Math.SQRT2-a[0]/a[1])+'\n'+mutual_division(a[0],a[1]));
 */
continued_fraction = function(sequence, max_no) {
	if (typeof s != 'object' || !sequence.length)
		return sequence;

	if (sequence[sequence.length - 2] === _.mutual_division.done)
		sequence.length -= 2;

	if (sequence.length < 1)
		return sequence;

	if (!max_no/* ||max_no<2 */|| max_no > sequence.length)
		max_no = sequence.length;

	var a, b;
	if (max_no % 2)
		b = 1, a = 0;
	else
		a = 1, b = 0;
	// s[max_no++]=1;if(--max_no%2)b=s[max_no],a=s[--max_no];else a=s[max_no],b=s[--max_no];

	//alert('a='+a+',b='+b+',max_no='+max_no);
	while (max_no--)
		if (max_no % 2)
			b += a * sequence[max_no];
		else
			a += b * sequence[max_no];
	//alert('a='+a+',b='+b);
	return [ a, b ];
};


_// JSDT:_module_
.
/**
 * The best rational approximation. 取得值最接近之有理數 (use 連分數 continued fraction), 近似值.
 * c.f.,調日法
 * 在分子或分母小於下一個漸進分數的分數中，其值是最接近精確值的近似值。
 * @example
 * rational_approximation(4088/783)
 * @param number	number
 * @param rate	比例在rate以上
 * @param max_no	最多取至序列第max_no個//TODO:並小於l:limit
 * @return	[分子, 分母, 誤差]
 * @requires	mutual_division,continued_fraction
 * @see
 * http://en.wikipedia.org/wiki/Continued_fraction#Best_rational_approximations
 */
rational_approximation = function(number, rate, max_no) {
	if (!rate)
		rate = 99;
	var d = _.mutual_division(number, 1, max_no && max_no > 0 ? max_no : 20), i = 0, a, b = d[0];
	if (!b)
		b = d[++i];
	while (++i < d.length && (a = d[i]))
		if (a / b < rate)
			b = a;
		else
			break;

	//library_namespace.debug(d+': '+d.length+','+i+','+d[i]);
	d = _.continued_fraction(d, i);
	//library_namespace.debug(d);
	if (d[1] < 0)
		d[0] = -d[0], d[1] = -d[1];

	return [ d[0], d[1], d[0] / d[1] - number ];
};


/*	最大公因數/公約數	 Greatest Common Divisor

usage:
	gcd(6,9)
	GCD([5,3,8,2,6,9])
*/
//_gcd[generateCode.dLK]='mutual_division,mutual_division_done';
function _gcd(a,b){
 if(isNaN(a)||isNaN(b))
  return isNaN(b)?a:b;

 var d=_.mutual_division(a,b);
 a=d.pop();
 if(d.pop()===_.mutual_division.done)
  return a;
}

_// JSDT:_module_
.
/**
 * Get GCD of 2 numbers
 * @param n1	number 1
 * @param n2	number 2
 * @return	GCD of the 2 numbers
 */
gcd = function(n1, n2) {
	/*
	if (isNaN(a))
		return b;
	*/
	//	必要!
	if (!n2 || isNaN(n2))
		return n1;

	//	也可最後再 Math.abs
	/*
	if (a < 0)
		a = -a;
	if (b < 0)
		b = -b;
	*/

	//	Euclidean algorithm
	var r;
	while (r = n1 % n2)
		n1 = n2, n2 = r;
	return n2 < 0 ? -n2 : n2;
};

//GCD[generateCode.dLK]='gcd';
function GCD(numA){
 var i=1,g=numA[0];
 for(;i<numA.length;i++)
  if(!isNaN(numA[i]))
   g=gcd(g,numA[i]);
 return g;
}
/*	最小公倍數	 Least Common Multiple

usage:
	lcm(6,9)
	lcm([5,3,8,2,6,9])

TODO:
更快的方法：
短除法
一次算出 GCD, LCM
*/
//lcm[generateCode.dLK]='gcd';
function lcm(a,b){
 var l,g,i=1;
 if( typeof a=='object' && !isNaN(l=a[0]) ){
  while(i<a.length)
   l=lcm(l,a[i++]);
  return l;
 }

 if( (g=gcd(a,b)) && !isNaN(g) )
  return a/g*b;
}


/*
http://www.math.umbc.edu/~campbell/NumbThy/Class/Programming/JavaScript.html
http://aoki2.si.gunma-u.ac.jp/JavaScript/
*/

//	得到平方數 r^2<=n<(r+1)^2
function floorSurt(n){
 if(isNaN(n))return;
 var g=0,v,h,t;
 while((t=2*g)<(v=n-g*g)){
  h=1;//alert(t+','+v);
  while(h*(h+t)<=v)h<<=1;
  g+=h>>1;
 }
 //alert('end:'+t+','+v);
 return g;
}
//var p=203456*203456-1,q=floorSurt(p);alert(q+'\n'+(q*q)+'\n'+p+'\n'+(++q*q));


/*	取得某數的質因數，因式分解/素因子分解
	唯一分解定理(The Unique Factorization Theorem)告訴我們素因子分解是唯一的，這即是稱為算術基本定理 (The Fundamental Theorem of Arithmeric) 的數學金科玉律。
	input:	num
	return:	array(prime1,power1,prime2,power2,..)
	Factorizations of 100...001	http://homepage2.nifty.com/m_kamada/math/10001.htm
*/
//getFloorFactor[generateCode.dLK]='floorSurt';
function getFloorFactor(n){
 var f=2,p,a,l,r=[];
 if(isNaN(n)||n<1||n>999999999999999934469)return;
 n=Math.floor(n);

 //	2,3
 while(n>1){
  if(n%f==0){
   p=0;
   do n/=f,p++;while(n%f==0);	//	do{n/=f,p++;}while(n%f==0);
   r.push(f,p);
  }
  if(++f>3)break;
 }

 a=4,f=5,l=floorSurt(n);	//	5-初始化
 while(n>1){
  if(f>l){r.push(n,1);break;}
  //document.write('<br/>'+f+','+n);
  if(n%f==0){
   p=0;
   do{n/=f,p++;}while(n%f==0);
   l=floorSurt(n),r.push(f,p);
  }
  f+=a=a==2?4:2;
 }
 return r;
}

/*	test
function count(n){
var a=getFloorFactor(n),s='',v=1;
if(a){
 for(var i=0;i<a.length;i+=2){s+='*'+a[i]+(a[i+1]>1?'^'+a[i+1]:'');v*=Math.pow(a[i],a[i+1]);}
 s=s.substr(1)+'='+v+'='+n;
}else s='error! '+n;
document.getElementById('result').value+=s+'\n-------------------------------------------\n';
}
*/


function turnBase(num,newBase,oldBase){
 var i=0,newN='',NBase='0123456789abcdef';	//	normal base(weight)
 if(typeof num=='string'&&typeof oldBase=='number'&&oldBase<NBase.length&&oldBase>0)oldBase=NBase.slice(0,oldBase);
 if(typeof newBase=='number'&&newBase<NBase.length&&newBase>0)newBase=NBase.slice(0,newBase);
 if(!newBase&&!oldBase||newBase==oldBase||typeof newBase!='string'||typeof oldBase!='string'
	|| isNaN(num) && (!oldBase||oldBase==NBase.slice(0,10))
	)return num;
 num=''+num;

 for(;i<num.length;i++);
 return newN;
}



/*	猜測一個數可能的次方數。	2005/2/18 19:20未完成
	type=0:整數,1:有理數
	return [base分子,base分母,exponent分子,exponent分母]
*/
function to_exponent(num,type){
 var bn,bd,en=1,ed,sq=[1,num],t,q,error=1e-9,g=function(n){q=_.rational_approximation(n,99999);if((!type||q[1]==1)&&!(q[0]>99999&&q[1]>99999)&&q[2]/n<error)bn=q[0],bd=q[1],ed=t;};//error:誤差

 if(!ed)g(sq[t=1]);
 if(!ed)g(sq[t=2]=sq[1]*sq[1]);
 if(!ed)g(sq[t=3]=sq[1]*sq[2]);
 if(!ed)g(sq[t=4]=sq[2]*sq[2]);
 if(!ed)g(sq[t=5]=sq[2]*sq[3]);
 if(!ed)bn=num,bd=ed=1;

 return [bn,bd,en,ed];
}
//var t=to_exponent(Math.pow(2/3,1/1));alert(t[0]+'/'+t[1]+'^'+t[2]+'/'+t[3]);




/*
for 出題

runCode.setR=0;
for(var i=0,j,t,s,n_e;i<10;){
 t=2000+8000*Math.random();
 s=get_random_prime.get_different_number_set(3,t,t/8);
 if(s.LCM>9999)continue;
 n_e=[];
 n_e[s.GCD]=1;
 for(j=0;j<s.length;j++)
  if(n_e[s[j]])continue;
  else n_e[s[j]]=1;
 sl([s.GCD,s.LCM]+'<b style="color:#c4a">;</b> '+s);i++;
}

*/

//	求乘積
function get_product(nums,till){	//	num array, 乘到比till小就回傳
 var p=1,i=0,l=nums.length;
 for(;i<l;i++){
  if(till&&p*nums[i]>till)break;
  p*=nums[i];
 }
 return p;
}


//	2009/10/21 11:57:47
//get_random_prime[generateCode.dLK]='get_product';
get_random_prime.primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];
function get_random_prime(count,exclude,all_different){	//	個數, 排除
 var _f=arguments.callee,i,j,p=[],l;
 if(!count||count<1)count=1;
 if(!_f.excluded)
  _f.excluded=[];
 if(exclude)exclude=[];

 for(j=0;j<count;j++){
  l=80;	//	timeout
  do{
   i=Math.round(10*Math.tan(Math.random()*1.5));
   if(!--l)return;	//	timeout
  }while(_f.excluded[i]);
  p.push(_f.primes[i]);
  if(exclude)exclude.push(i);
 }

 //	選完才排除本次選的
 if(exclude)
  for(j=0,l=exclude.length;j<l;j++){
   i=exclude[j];
   if(_f.excluded[i])_f.excluded[i]++;
   else _f.excluded[i]=1;
  }

 return count==1?p[0]:p;
}

//	return [GCD, n1, n2, ..]
get_random_prime.get_different_number_set=function(count,till,GCD_till){
 delete this.excluded;
 if(!GCD_till)GCD_till=1e5;
 if(!till)till=1e5;

 var GCD=get_product(this(20,1),GCD_till),na=[],n_e=[],n,i=0,out;
 n_e[GCD]=1;

 for(;i<count;i++){
  out=80;	//	timeout
  do{
   n=this(20);
   n.unshift(GCD);
   n=get_product(n,till);
  }while(n_e[n]&&--out);
  n_e[n]=1;
  na.push(n);
 }

 if(typeof lcm=='function')
  na.LCM=lcm(na);
 na.GCD=GCD;
 return na;
};






/*	VBScript has a Hex() function but JScript does not.
alert('0x'+hex(16725))
*/
function hex(n){return(n<0?n+0x100000000:n-0).toString(16);}



/*	↑Math	---------------------------------------------------------------
*/





return (
	_// JSDT:_module_
);
};

//============================================================================

CeL.setup_module(module_name, code_for_including);

};
