#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check_md_helper.py
被 check_md.bat 调用，检查单个 .md 文件的格式问题。
"""

import re
import sys

# ------------------------------------------------------------------
# ANSI 颜色
# ------------------------------------------------------------------
def _a(code): return f"\033[{code}m"

RESET   = _a(0)
BOLD    = _a(1)
DIM     = _a(2)
RED     = _a(91)
YELLOW  = _a(93)
CYAN    = _a(96)
GREEN   = _a(92)
MAGENTA = _a(95)
BG_YEL  = _a(43)
BG_CYA  = _a(46)
BG_MAG  = _a(45)
BLACK   = _a(30)

# 启用 Windows VT 虚拟终端（Windows 10+ 需要显式开启）
if sys.platform == "win32":
    import ctypes
    k = ctypes.windll.kernel32
    k.SetConsoleMode(k.GetStdHandle(-11), 7)

# 规则 → (前景色, 背景色)
RULE_STYLE = {
    1: (YELLOW,  BG_YEL),
    2: (CYAN,    BG_CYA),
    3: (MAGENTA, BG_MAG),
}

CONTEXT = 20

# ------------------------------------------------------------------

def make_snippet(text, start, end, rule_num):
    """截取上下文，用彩色背景高亮问题字符。"""
    _, bg = RULE_STYLE.get(rule_num, (RED, _a(41)))
    pre   = text[max(0, start - CONTEXT):start].replace("\n", "↵")
    mid   = text[start:end].replace("\n", "↵")
    post  = text[end:min(len(text), end + CONTEXT)].replace("\n", "↵")
    return f"{DIM}…{RESET}{pre}{bg}{BLACK}{mid}{RESET}{post}{DIM}…{RESET}"

def line_col(text, pos):
    lines = text[:pos].split("\n")
    return len(lines), len(lines[-1]) + 1

def check_file(path):
    print(f"\n{BOLD}{CYAN}{'='*62}{RESET}")
    print(f"{BOLD}{CYAN}  {path}{RESET}")
    print(f"{BOLD}{CYAN}{'='*62}{RESET}")

    try:
        with open(path, encoding="utf-8") as f:
            text = f.read()
    except Exception as e:
        print(f"{RED}  无法读取文件: {e}{RESET}")
        return

    issues = []

    # 规则 1：英文/数字 与 中文/全角字符之间缺少空格
    CJK   = r'[\u4e00-\u9fff\u3400-\u4dbf\uff00-\uffef\u3000-\u303f]'
    ASCII = r'[A-Za-z0-9]'
    for m in re.finditer(rf'({ASCII})({CJK})', text):
        ln, col = line_col(text, m.start())
        issues.append((ln, col, 1, "英→中 缺空格", make_snippet(text, m.start(), m.end(), 1)))
    for m in re.finditer(rf'({CJK})({ASCII})', text):
        ln, col = line_col(text, m.start())
        issues.append((ln, col, 1, "中→英 缺空格", make_snippet(text, m.start(), m.end(), 1)))

    # 规则 2：Markdown 链接前后缺空格
    LINK_RE = re.compile(r'\[([^\]]*)\]\(([^)]*)\)')
    PUNCT   = r'[\s，。！？、；：\u201c\u201d\u2018\u2019「」（）【】《》〈〉\[\]().,!?;:\-]'
    for m in LINK_RE.finditer(text):
        s, e = m.start(), m.end()
        if s > 0 and not re.match(PUNCT, text[s - 1]):
            ln, col = line_col(text, s)
            issues.append((ln, col, 2, "链接前缺空格", make_snippet(text, max(0, s-1), e, 2)))
        if e < len(text) and not re.match(PUNCT, text[e]):
            ln, col = line_col(text, s)
            issues.append((ln, col, 2, "链接后缺空格", make_snippet(text, s, min(len(text), e+1), 2)))

    # 规则 3：全角弯引号 " "
    for m in re.finditer(r'[\u201c\u201d]', text):
        ln, col = line_col(text, m.start())
        issues.append((ln, col, 3, '全角引号 \u201c\u201d', make_snippet(text, m.start(), m.end(), 3)))

    # 输出
    if not issues:
        print(f"\n  {GREEN}{BOLD}✓ 未发现问题{RESET}\n")
        return

    issues.sort(key=lambda x: (x[0], x[1]))

    counts = {}
    for _, _, rn, _, _ in issues:
        counts[rn] = counts.get(rn, 0) + 1

    for ln, col, rn, label, snippet in issues:
        fg, _ = RULE_STYLE.get(rn, (RED, _a(41)))
        print(f"  {fg}{BOLD}[规则{rn}]{RESET} {DIM}第{ln:>4}行 第{col:>3}列{RESET}  {fg}{label}{RESET}")
        print(f"     {snippet}")
        print()

    rule_names = {1: "缺空格", 2: "链接空格", 3: "引号"}
    summary = f"  {'─'*58}\n  共发现: "
    for rn, cnt in sorted(counts.items()):
        fg, _ = RULE_STYLE[rn]
        summary += f"{fg}{BOLD}规则{rn} {rule_names[rn]} ×{cnt}{RESET}   "
    print(summary + "\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python check_md_helper.py <file.md>")
        sys.exit(1)
    check_file(sys.argv[1])
