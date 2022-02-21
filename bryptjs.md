#[Tối ưu Performance ứng dụng nodejs] bcryptjs hay bcrypt.

## 1. Mở đầu:

Cho bạn nào chưa biết, [Bcrypt](https://en.wikipedia.org/wiki/Bcrypt) là một dạng hash function thường sử dụng để mã hóa password với mục đích [tăng cường bảo mật](https://codahale.com/how-to-safely-store-a-password/). Hiện nay có hai packages phổ biến hỗ trợ việc thực hiện bcrypt là [bcrypt](https://www.npmjs.com/package/bcrypt) và [brcyptjs](https://www.npmjs.com/package/bcryptjs) (*có thêm chữ js*). Hai packages này có gì khác nhau ? Chúng ta cùng nhau so sánh và mượn việc so sánh này để hiểu ro hơn về nodejs và việc tối ưu ứng dụng nodejs.

## 2. So sánh chung

| Tiêu chí             | Bcrypt  | Bcryptjs  |
| -------------------- | ------- | --------- |
| Lượt download 1 tuần | 886,772 | 1,307,104 |
| Issues               | 28      | 27        |
| Số sao github        | 6,2k    | 2,9k      |
| Release lần đâu      | 2017    | 2014      |
| Ngôn ngữ             |     50%C++, 50% Javascript    | Javascript with no zero dependencies JS       |

Nhận xét chung là Brcyptjs có nhiều lượt download hơn, release sớm hơn, nhưng bcrypt có nhiều sao trên github hơn.

## 3. So sánh Performance:

### 3.1 Hash 10 round.
#### Bcryptjs
Để so sánh Performance của package bcryptjs ta sử dụng đoạn code sau:

```javascript
const bcrypt = require("bcryptjs")

function hash() {
  const start = new Date()
  const hashRounds = 10
  bcrypt.hash("hash 10 rounds!", hashRounds, () => {
    console.log(`Hashing time: ${new Date() - start} ms`)
    setTimeout(hash)
  });
}
hash()

```

Kết quả:

```log
Hashing time: 90 ms
Hashing time: 77 ms
Hashing time: 76 ms
Hashing time: 74 ms
Hashing time: 77 ms
Hashing time: 77 ms
```

#### Bcrypt
Để so sánh Performance của package bcryptjs ta sử dụng đoạn code trên nhưng chỉ cần thay đôi packgage name ở trong require từ `bcryptjs` thành `bcrypt`:

```javascript
const bcrypt = require("bcryptjs")

function hash() {
  const start = new Date()
  const hashRounds = 10
  bcrypt.hash("hash 10 rounds!", hashRounds, () => {
    console.log(`Hashing time: ${new Date() - start} ms`)
    setTimeout(hash)
  });
}
hash()

```

Kết quả:

```log
Hashing time: 57 ms
Hashing time: 57 ms
Hashing time: 62 ms
Hashing time: 58 ms
Hashing time: 58 ms
Hashing time: 57 ms
Hashing time: 57 ms
```

#### Kết luận:
Bcrypt nhìn chung nhanh hơn Bcryptjs nhưng sự khác biệt không rõ ràng. Chung ta cùng tăng độ phức tạp của hàm hash lên 15 rounds để  xem có khác biệt lớn không.


### 3.2 Hash 15 round.

Giư nguyên code, chỉ thây đổ i `hashRounds = 10` thành `hashRounds = 15`

#### Bcryptjs
Kết quả:

```log
Hashing time: 2345 ms
Hashing time: 2295 ms
Hashing time: 2299 ms
Hashing time: 2304 ms
Hashing time: 2292 ms
```

#### Bcrypt
Kết quả:

```log
Hashing time: 1731 ms
Hashing time: 1726 ms
Hashing time: 1720 ms
Hashing time: 1723 ms
Hashing time: 1721 ms
```
#### Kết luận:
Ta có thể kết luận Bcrypt nhanh hơn Bcryptjs 30%.
Nhưng kết quả test vẫn chưa mô tả hết được sự khác biệt của hai pakages do thực tế các hàm hash không bao giờ chạy độc lập. Một ứng dụng nodejs luôn chạy bất đồng bộ với nhiều công việc đồng thời. Chúng ta đến với bài test thứ 3 để hiểu rõ hơn.

### 3.3 Hash đồ thời với 1 công việc khác.

Chung ta sử dụng một hàm setTimeOut để  mô tả đơn gian một công việc *(1 process)* thực hiện bất đồng bộ. Chúng ta thêm phần code này vào phía trên các file ở mục 3.1.

```javascript
function otherProcess(iteration) {
  const start = new Date()
  setTimeout(() => {
    const lag = new Date() - start
    console.log(`Process ${iteration} took\t${lag} ms`)
    otherProcess(iteration + 1)
  })
}
otherProcess(1)
```
#### Bcryptjs
Kết quả:

```log
Process 1 took  1 ms
Process 2 took  91 ms
Hashing time: 94 ms
Process 3 took  1 ms
Process 4 took  1 ms
Process 5 took  77 ms
Hashing time: 77 ms
Process 6 took  2 ms
Process 7 took  76 ms
Hashing time: 77 ms
Process 8 took  1 ms
Process 9 took  76 ms
Hashing time: 76 ms
Process 10 took 0 ms
Process 11 took 2 ms
Process 12 took 75 ms
Hashing time: 75 ms
```

#### Bcrypt
Kết quả:

```log
Process 1 took  3 ms
Process 2 took  1 ms
Process 3 took  1 ms
...
Process 50 took 2 ms
Process 51 took 1 ms
Hashing time: 62 ms
```

#### Kết luận:
Trong 1 lần hash Bcryptjs chỉ có thể thực hiện cùng lúc 2 process, Bcrypt lại có thể thực hiện hơn 50 process. Hash với Bcrypt thì ứng dụng sẽ thực hiện nhiều công việc đồng thời hơn khi sử dụng Bcryptjs, ứng dụng có  Performance tốt hơn nhiều lần

### 4. Nguyên nhân:
- Bcrypt nhìn chung nhanh hơn Bcryptjs là do Bcrypt code bằng C++, Bcryptjs viết bằng javascript
- Hash với Bcrypt thì ứng dụng sẽ thực hiện nhiều công việc đồng thời hơn khi sử dụng Bcryptjs. Cũng là do Bcryptjs viết bằng javascript do đó phần tính toán thực hiện ở main thread, js chỉ có 1 thread nên ứng dụng sẽ bị block khi thực hiện hash. Về phần Bcrypt c++ nên phần tính toán hash sẽ được thực hiện ở một thread khác.
  
### 5. Kinh nghiệm:

- Khi gặp một công việc có tính toán nhiều, render ảnh, tính toán số liệu, hash, mã hóa, để tăng Performance ta có thể tạo một [worker thread](https://nodejs.org/api/worker_threads.html) mới hoặc đưa phần logic này vào môt package [C++ Addon](https://nodejs.org/api/addons.html) hoặc thực hiện ở một service chạy bằng ngôn ngữ khác.