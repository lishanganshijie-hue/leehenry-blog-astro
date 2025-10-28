// src/scripts/twikoo-loader.js

(function () {
	console.log('[TwikooLoader] 脚本开始执行');
	
	if (window.__twikooLoaderInitialized) {
		console.log('[TwikooLoader] 已初始化，跳过');
		return;
	}
	window.__twikooLoaderInitialized = true;
	console.log('[TwikooLoader] 初始化标记已设置');

	let twikooLoadTimer;

	// ✅ 加载评论数量
	const loadTwikooCommentCount = () => {
		console.log('[TwikooLoader] loadTwikooCommentCount 被调用');
		console.log('[TwikooLoader] window.twikoo 存在:', !!window.twikoo);
		
		if (!window.twikoo) {
			console.warn('[TwikooLoader] window.twikoo 不存在，退出');
			return;
		}

		const commentEls = document.querySelectorAll(".comment-count[data-path]");
		console.log('[TwikooLoader] 找到评论计数元素:', commentEls.length);
		
		if (commentEls.length === 0) {
			console.log('[TwikooLoader] 没有评论计数元素，退出');
			return;
		}

		const paths = Array.from(commentEls)
			.map((el) => el.dataset.path)
			.map((path) => path.split("/").map(encodeURIComponent).join("/"));

		// 从全局配置获取Twikoo参数
		const twikooConfig = window.twikooConfig || {};
		console.log('[TwikooLoader] Twikoo配置:', twikooConfig);
		console.log('[TwikooLoader] 请求评论数量的路径:', paths);

		window.twikoo
			.getCommentsCount({
				envId: twikooConfig.envId || "",
				region: twikooConfig.region || "",
				urls: paths,
				includeReply: true,
			})
			.then((res) => {
				console.log('[TwikooLoader] 获取评论数量成功:', res);
				res.forEach((item) => {
					const el = document.querySelector(
						`.comment-count[data-path="${decodeURIComponent(item.url)}"] span:nth-child(1)`,
					);
					if (el) {
						el.textContent = `${item.count}`;
						console.log(`[TwikooLoader] 更新评论数 ${item.url}: ${item.count}`);
					}
				});
			})
			.catch((error) => {
				console.error('[TwikooLoader] 获取评论数量失败:', error);
			});
	};

	// ✅ 确保 Twikoo 加载
	const ensureTwikooLoaded = () => {
		console.log('[TwikooLoader] ensureTwikooLoaded 被调用');
		clearTimeout(twikooLoadTimer);
		twikooLoadTimer = setTimeout(() => {
			if (window.twikooLoaded) {
				console.log('[TwikooLoader] Twikoo 已加载，加载评论数量');
				loadTwikooCommentCount();
			} else if (!window.twikooLoading) {
				console.log('[TwikooLoader] 开始加载 Twikoo 脚本');
				window.twikooLoading = true;
				const script = document.createElement("script");
				// 使用 unpkg CDN，第一优先级
				script.src =
					"https://unpkg.com/twikoo@1.6.44/dist/twikoo.all.min.js";
				script.onload = () => {
					console.log('[TwikooLoader] Twikoo 脚本加载成功');
					window.twikooLoaded = true;
					loadTwikooCommentCount();
				};
				script.onerror = (error) => {
					console.error('[TwikooLoader] Twikoo 脚本加载失败:', error);
				};
				document.head.appendChild(script);
			} else {
				console.log('[TwikooLoader] Twikoo 正在加载中...');
			}
		}, 200);
	};

	// ✅ 绑定事件（只绑定一次）
	const bindEvents = () => {
		console.log('[TwikooLoader] 绑定页面切换事件');
		const safeReload = () => {
			console.log('[TwikooLoader] 页面切换事件触发');
			ensureTwikooLoaded();
		};
		document.addEventListener("astro:page-load", safeReload);
		document.addEventListener("swup:page:view", safeReload);
	};

	// 初始化
	console.log('[TwikooLoader] 开始初始化');
	ensureTwikooLoaded();
	bindEvents();
	console.log('[TwikooLoader] 初始化完成');
})();

