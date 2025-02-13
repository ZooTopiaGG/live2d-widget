/*
 * Live2D Widget
 * https://github.com/zootopiagg@gmail.com/live2d-widget
 */
var isProd = location.hostname.indexOf("edu.dingdangcode.com") > -1;
var hosts = isProd
  ? "https://api.dingdangcode.com/"
  : "https://api.dingdangcode.cn/";

function generateUUID() {
  var d = new Date().getTime();
  if (window.performance && typeof window.performance.now === "function") {
    d += performance.now(); //use high-precision timer if available
  }
  var uuid = "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

function request(url, config) {
  try {
    // 接口签名校验
    let _headers = [],
      signToken = "766a6afe879b44bd9c5c7518746bd0e4",
      timestamp = Date.now().toString(),
      nonce = generateUUID();
    _headers.push(signToken, timestamp, nonce);
    let shaStr = sha1(_headers.sort().join(""));
    // 接口签名校验
    let token = window.sessionStorage.getItem("EDU_TOKEN") || "";
    let header = {
      headers: {
        timestamp,
        nonce,
        signature: shaStr,
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
        token,
      },
    };
    return fetch(url, Object.assign(config, header))
      .then((res) => {
        if (!res.ok) {
          // 服务器异常返回
          throw Error("");
        }
        return res.json();
      })
      .then((resJson) => {
        if (resJson.code === 36 || resJson.code === 25) {
          // 登录凭证无效或已过期
          // window.localStorage.removeItem('token');
          //   location.reload();
        }
        return resJson;
      })
      .catch((error) => {
        // 公共错误处理
        console.log(error);
      });
  } catch (e) {
    console.log(e);
  }
}

// POST请求
function post(url, data) {
  if (data && typeof data !== "string") {
    data = JSON.stringify(data);
  }
  return request(`${url}?time=${Date.now()}`, {
    body: data,
    method: "POST",
  });
}

// 埋点
function buried(params) {
  return post(hosts + "ddc-hadoop/buried/buried", {
    batchCode: null,
    ...params,
    body: params.body,
    event: params.event,
    eventName: params.eventName,
  });
}

function loadWidget(config) {
  let { waifuPath, apiPath, cdnPath } = config;
  console.log("config:", config);
  let useCDN = false,
    modelList;
  if (typeof cdnPath === "string") {
    useCDN = true;
    if (!cdnPath.endsWith("/")) cdnPath += "/";
  } else if (typeof apiPath === "string") {
    if (!apiPath.endsWith("/")) apiPath += "/";
  } else {
    console.error("Invalid initWidget argument!");
    return;
  }
  localStorage.removeItem("waifu-display");
  sessionStorage.removeItem("waifu-text");
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div id="waifu">
  		<div id="waifu-tips"></div>
  		<canvas id="live2d" width="800" height="800"></canvas>
  		<div id="waifu-tool">
        <span class="wt wt-icon fa-comment"></span>
        <span class="wt wt-icon fa-study-hall"></span>
        <span class="wt wt-icon fa-service"></span>
        <span class="wt wt-icon fa-times"></span>
      </div>
  	</div>`
  );
  // https://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
  setTimeout(() => {
    document.getElementById("waifu").style.bottom = 0;
  }, 0);

  function randomSelection(obj) {
    return Array.isArray(obj)
      ? obj[Math.floor(Math.random() * obj.length)]
      : obj;
  }
  // 检测用户活动状态，并在空闲时显示消息
  let userAction = false,
    userActionTimer,
    messageTimer,
    messageArray = [
      "好久不见，日子过得好快呢……",
      "大坏蛋！你都多久没理人家了呀，嘤嘤嘤～",
      "嗨～快来逗我玩吧！",
      "拿小拳拳锤你胸口！",
      "记得把小家加入 Adblock 白名单哦！",
    ];
  window.addEventListener("mousemove", () => (userAction = true));
  window.addEventListener("keydown", () => (userAction = true));
  setInterval(() => {
    if (userAction) {
      userAction = false;
      clearInterval(userActionTimer);
      userActionTimer = null;
    } else if (!userActionTimer) {
      userActionTimer = setInterval(() => {
        showMessage(randomSelection(messageArray), 6000, 9);
      }, 20000);
    }
  }, 1000);

  // 打开新窗口
  function winOpen(url) {
    let a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("target", "_blank");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  (function registerEventListener() {
    document.querySelector("#live2d").addEventListener("click", (e) => {
      e.stopImmediatePropagation();
      e.stopPropagation();
      buried({
        body: {
          click_from: location.href,
          type: "mascot",
        },
        event: "mascotHot",
        eventName: "吉祥物热度",
      });
    });
    document
      .querySelector("#waifu-tool .fa-comment")
      .addEventListener("click", showHitokoto);
    document
      .querySelector("#waifu-tool .fa-study-hall")
      .addEventListener("click", () => {
        buried({
          body: {
            click_from: location.href,
            type: "mascotToC",
          },
          event: "mascotHot",
          eventName: "吉祥物热度",
        });
        winOpen("https://vip.dingdangcode.com/learning");
      });
    // document
    //   .querySelector("#waifu-tool .fa-paper-plane")
    //   .addEventListener("click", () => {
    //     if (window.Asteroids) {
    //       if (!window.ASTEROIDSPLAYERS) window.ASTEROIDSPLAYERS = [];
    //       window.ASTEROIDSPLAYERS.push(new Asteroids());
    //     } else {
    //       const script = document.createElement("script");
    //       script.src =
    //         "https://cdn.jsdelivr.net/gh/stevenjoezhang/asteroids/asteroids.js";
    //       document.head.appendChild(script);
    //     }
    //   });
    document
      .querySelector("#waifu-tool .fa-service")
      .addEventListener("click", loadMeiQiaService);
    // document
    //   .querySelector("#waifu-tool .fa-user-circle")
    //   .addEventListener("click", loadOtherModel);
    // document
    //   .querySelector("#waifu-tool .fa-street-view")
    //   .addEventListener("click", loadRandModel);
    // document
    //   .querySelector("#waifu-tool .fa-camera-retro")
    //   .addEventListener("click", () => {
    //     showMessage("照好了嘛，是不是很可爱呢？", 6000, 9);
    //     Live2D.captureName = "photo.png";
    //     Live2D.captureFrame = true;
    //   });
    // document
    //   .querySelector("#waifu-tool .fa-info-circle")
    //   .addEventListener("click", () => {
    //     open("https://github.com/stevenjoezhang/live2d-widget");
    //   });
    document
      .querySelector("#waifu-tool .fa-times")
      .addEventListener("click", () => {
        buried({
          body: {
            click_from: location.href,
            type: "mascotClose",
          },
          event: "mascotHot",
          eventName: "吉祥物热度",
        });
        localStorage.setItem("waifu-display", Date.now());
        showMessage("愿你有一天能与重要的人重逢。", 2000, 11);
        document.getElementById("waifu").style.bottom = "-500px";
        setTimeout(() => {
          document.getElementById("waifu").style.display = "none";
          document
            .getElementById("waifu-toggle")
            .classList.add("waifu-toggle-active");
        }, 3000);
      });
    const devtools = () => {};
    console.log("%c", devtools);
    devtools.toString = () => {
      showMessage("哈哈，你打开了控制台，是想要看看我的小秘密吗？", 6000, 9);
    };
    window.addEventListener("copy", () => {
      showMessage("你都复制了些什么呀！", 6000, 9);
    });
    window.addEventListener("visibilitychange", () => {
      if (!document.hidden) showMessage("哇，你终于回来了～", 6000, 9);
    });
  })();

  (function welcomeMessage() {
    let text;
    if (location.pathname === "/") {
      // 如果是主页
      const now = new Date().getHours();
      if (now > 5 && now <= 7)
        text = "早上好！一日之计在于晨，美好的一天就要开始了。";
      else if (now > 7 && now <= 11) text = "上午好！好好学习，天天向上哦~";
      else if (now > 11 && now <= 13)
        text = "中午了，学习了一个上午，现在是午餐时间！";
      else if (now > 13 && now <= 17)
        text = "午后很容易犯困呢，学习的时候不要走神哦~";
      else if (now > 17 && now <= 19)
        text = "傍晚了！窗外夕阳的景色很美丽呢，最美不过夕阳红～";
      else if (now > 19 && now <= 21) text = "晚上好，今天过得怎么样？";
      else if (now > 21 && now <= 23)
        text = ["已经这么晚了呀，早点休息吧，晚安～", "深夜时要爱护眼睛呀！"];
      else text = "你是夜猫子呀？这么晚还不睡觉，明天起的来嘛？";
    } else if (document.referrer !== "") {
      const referrer = new URL(document.referrer),
        domain = referrer.hostname.split(".")[1];
      if (location.hostname === referrer.hostname)
        text = `欢迎来到<span>「${document.title.split(" - ")[0]}」</span>`;
      else if (domain === "baidu")
        text = `Hello！来自 百度搜索 的朋友<br>你是搜索 <span>${
          referrer.search.split("&wd=")[1].split("&")[0]
        }</span> 找到的我吗？`;
      else if (domain === "so")
        text = `Hello！来自 360搜索 的朋友<br>你是搜索 <span>${
          referrer.search.split("&q=")[1].split("&")[0]
        }</span> 找到的我吗？`;
      else if (domain === "google")
        text = `Hello！来自 谷歌搜索 的朋友<br>欢迎来到<span>「${
          document.title.split(" - ")[0]
        }」</span>`;
      else text = `Hello！来自 <span>${referrer.hostname}</span> 的朋友`;
    } else {
      text = `欢迎来到<span>「${document.title.split(" - ")[0]}」</span>`;
    }
    showMessage(text, 7000, 8);
  })();

  function showHitokoto() {
    buried({
      body: {
        click_from: location.href,
        type: "mascotDialogue",
      },
      event: "mascotHot",
      eventName: "吉祥物热度",
    });
    // 增加 hitokoto.cn 的 API
    fetch("https://v1.hitokoto.cn")
      .then((response) => response.json())
      .then((result) => {
        const text = `这句一言来自 <span>「${result.from}」</span>`;
        showMessage(result.hitokoto, 6000, 9);
        setTimeout(() => {
          showMessage(text, 4000, 9);
        }, 6000);
      });
  }

  function showMessage(text, timeout, priority) {
    if (
      !text ||
      (sessionStorage.getItem("waifu-text") &&
        sessionStorage.getItem("waifu-text") > priority)
    )
      return;
    if (messageTimer) {
      clearTimeout(messageTimer);
      messageTimer = null;
    }
    text = randomSelection(text);
    sessionStorage.setItem("waifu-text", priority);
    const tips = document.getElementById("waifu-tips");
    tips.innerHTML = text;
    tips.classList.add("waifu-tips-active");
    messageTimer = setTimeout(() => {
      sessionStorage.removeItem("waifu-text");
      tips.classList.remove("waifu-tips-active");
    }, timeout);
  }

  (function initModel() {
    let modelId = localStorage.getItem("modelId"),
      modelTexturesId = localStorage.getItem("modelTexturesId");
    if (modelId === null) {
      // 首次访问加载 指定模型 的 指定材质
      modelId = 2; // 模型 ID
      modelTexturesId = 53; // 材质 ID
    }
    console.log(modelId, modelTexturesId);
    loadModel(modelId, modelTexturesId);
    fetch(waifuPath)
      .then((response) => response.json())
      .then((result) => {
        window.addEventListener("mouseover", (event) => {
          for (let { selector, text } of result.mouseover) {
            if (!event.target.matches(selector)) continue;
            text = randomSelection(text);
            text = text.replace("{text}", event.target.innerText);
            showMessage(text, 4000, 8);
            return;
          }
        });
        window.addEventListener("click", (event) => {
          for (let { selector, text } of result.click) {
            if (!event.target.matches(selector)) continue;
            text = randomSelection(text);
            text = text.replace("{text}", event.target.innerText);
            showMessage(text, 4000, 8);
            return;
          }
        });
        result.seasons.forEach(({ date, text }) => {
          const now = new Date(),
            after = date.split("-")[0],
            before = date.split("-")[1] || after;
          if (
            after.split("/")[0] <= now.getMonth() + 1 &&
            now.getMonth() + 1 <= before.split("/")[0] &&
            after.split("/")[1] <= now.getDate() &&
            now.getDate() <= before.split("/")[1]
          ) {
            text = randomSelection(text);
            text = text.replace("{year}", now.getFullYear());
            //showMessage(text, 7000, true);
            messageArray.push(text);
          }
        });
      });
  })();

  async function loadModelList() {
    const response = await fetch(`${cdnPath}model_list.json`);
    modelList = await response.json();
  }

  async function loadModel(modelId, modelTexturesId, message) {
    localStorage.setItem("modelId", modelId);
    localStorage.setItem("modelTexturesId", modelTexturesId);
    showMessage(message, 4000, 10);
    if (useCDN) {
      if (!modelList) await loadModelList();
      const target = randomSelection(modelList.models[modelId]);
      loadlive2d("live2d", `${cdnPath}model/${target}/index.json`);
    } else {
      loadlive2d("live2d", `${apiPath}get/?id=${modelId}-${modelTexturesId}`);
      console.log(`Live2D 模型 ${modelId}-${modelTexturesId} 加载完成`);
    }
  }

  async function loadRandModel() {
    const modelId = localStorage.getItem("modelId"),
      modelTexturesId = localStorage.getItem("modelTexturesId");
    if (useCDN) {
      if (!modelList) await loadModelList();
      const target = randomSelection(modelList.models[modelId]);
      loadlive2d("live2d", `${cdnPath}model/${target}/index.json`);
      showMessage("我的新衣服好看嘛？", 4000, 10);
    } else {
      // 可选 "rand"(随机), "switch"(顺序)
      fetch(`${apiPath}rand_textures/?id=${modelId}-${modelTexturesId}`)
        .then((response) => response.json())
        .then((result) => {
          if (
            result.textures.id === 1 &&
            (modelTexturesId === 1 || modelTexturesId === 0)
          )
            showMessage("我还没有其他衣服呢！", 4000, 10);
          else loadModel(modelId, result.textures.id, "我的新衣服好看嘛？");
        });
    }
  }

  async function loadOtherModel() {
    let modelId = localStorage.getItem("modelId");
    if (useCDN) {
      if (!modelList) await loadModelList();
      const index = ++modelId >= modelList.models.length ? 0 : modelId;
      loadModel(index, 0, modelList.messages[index]);
    } else {
      fetch(`${apiPath}switch/?id=${modelId}`)
        .then((response) => response.json())
        .then((result) => {
          loadModel(result.model.id, 0, result.model.message);
        });
    }
  }

  (function meiQiaService() {
    /* eslint-disable */
    (function (m, ei, q, i, a, j, s) {
      m[i] =
        m[i] ||
        function () {
          (m[i].a = m[i].a || []).push(arguments);
        };
      (j = ei.createElement(q)), (s = ei.getElementsByTagName(q)[0]);
      j.async = true;
      j.charset = "UTF-8";
      j.src = "https://static.meiqia.com/dist/meiqia.js?_=t";
      s.parentNode.insertBefore(j, s);
    })(window, document, "script", "_MEIQIA");
    _MEIQIA("entId", "0936bc855fb73d043266e23bcb88ee4b");
    _MEIQIA("manualInit"); /*开启手动模式*/
    _MEIQIA("withoutBtn"); /*无按钮*/
    _MEIQIA("init"); /*初始化*/
  })();

  // 美洽客服
  async function loadMeiQiaService() {
    buried({
      body: {
        click_from: location.href,
        type: "mascotService",
      },
      event: "mascotHot",
      eventName: "吉祥物热度",
    });
    _MEIQIA("showPanel");
  }
}

function initWidget(config, apiPath) {
  if (typeof config === "string") {
    config = {
      waifuPath: config,
      apiPath,
    };
  }
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div id="waifu-toggle">
			<span>看板娘</span>
		</div>`
  );
  const toggle = document.getElementById("waifu-toggle");
  toggle.addEventListener("click", () => {
    toggle.classList.remove("waifu-toggle-active");
    if (toggle.getAttribute("first-time")) {
      loadWidget(config);
      toggle.removeAttribute("first-time");
    } else {
      localStorage.removeItem("waifu-display");
      document.getElementById("waifu").style.display = "";
      setTimeout(() => {
        document.getElementById("waifu").style.bottom = 0;
      }, 0);
    }
  });
  if (
    localStorage.getItem("waifu-display") &&
    Date.now() - localStorage.getItem("waifu-display") <= 86400000
  ) {
    toggle.setAttribute("first-time", true);
    setTimeout(() => {
      toggle.classList.add("waifu-toggle-active");
    }, 0);
  } else {
    loadWidget(config);
  }
}
