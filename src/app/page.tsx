'use client'
import { useState, useRef, useEffect } from 'react'

const API_TOUTIAO = 'https://api.vvhan.com/api/hotlist/toutiao'
const API_WEIBO = 'https://api.vvhan.com/api/hotlist/wbHot'

// 所有文章库分类
const CATEGORIES = ['全部', '财经', '科技', '美食', '军事', '国际', '体育', '娱乐', '历史', '微头条', '汽车', '法律', 'NBA', '热点', '三农', '情感', '股票', '彩票', '数码', '游戏', '电影']

// 一比一复刻的模板库分类
const TEMPLATE_CATS = ['全部', '头条创作', '公众号', '视频文案', '论文助手', '专业技能', '生活娱乐']

// 一比一复刻的模板数据（提取自参考网站）
const TEMPLATES_DATA = [
  { title: '爆款标题生成', desc: '爆款标题生成', cat: '头条创作', icon: '🔥' },
  { title: '今日头条【通用配图版】', desc: '根据主题创作优质内容', cat: '头条创作', icon: '📰' },
  { title: '今日头条【情感配图版】', desc: '根据主题创作优质内容', cat: '头条创作', icon: '📰' },
  { title: '今日头条创作【通用版】', desc: '根据题目写文章', cat: '头条创作', icon: '📰' },
  { title: '今日头条创作【简洁版】', desc: '请输入你要创作的主题描述', cat: '头条创作', icon: '📰' },
  { title: '今日头条创作【健康养生】', desc: '根据主题创作优质内容', cat: '头条创作', icon: '📰' },
  { title: '今日头条创作【三农】', desc: '根据主题创作内容', cat: '头条创作', icon: '📰' },
  { title: '今日头条创作【体育】', desc: '根据主题创作优质内容', cat: '头条创作', icon: '📰' },
  { title: '今日头条创作【情感】', desc: '根据主题创作优质内容', cat: '头条创作', icon: '📰' },
  { title: '今日头条创作【军事】', desc: '根据主题创作优质内容', cat: '头条创作', icon: '📰' },
  { title: '标题生成', desc: '生成10个同类型标题', cat: '头条创作', icon: '✨' },
  { title: '微头条二创', desc: '根据原文进行二创', cat: '头条创作', icon: '📝' },
  { title: '微头条情感内容创作', desc: '根据标题生成内容', cat: '头条创作', icon: '💔' },
  { title: '生成10条优质标题', desc: '输入文章领域，生成标题', cat: '头条创作', icon: '✨' },
  { title: '公众号文章【汽车】', desc: '公众号汽车文章生成', cat: '公众号', icon: '🚗' },
  { title: '公众号文章【娱乐】', desc: '公众号娱乐文章生成', cat: '公众号', icon: '🎬' },
  { title: '公众号文章【三农】', desc: '公众号三农文章生成', cat: '公众号', icon: '🌾' },
  { title: '公众号文章【情感】', desc: '公众号情感文章生成', cat: '公众号', icon: '❤️' },
  { title: '公众号文章【情感故事】', desc: '公众号情感故事文章创作', cat: '公众号', icon: '📖' },
  { title: '视频文案创作【通用】', desc: '根据标题生成视频文案', cat: '视频文案', icon: '🎥' },
  { title: '视频文案创作【科普】', desc: '根据标题生成视频文案', cat: '视频文案', icon: '🎥' },
  { title: '视频文案创作【体育】', desc: '根据标题生成视频文案', cat: '视频文案', icon: '🎥' },
  { title: '短视频文案创作【养生类】', desc: '养生类短视频文案生成', cat: '视频文案', icon: '🎥' },
  { title: '视频文案创作【国际资讯】', desc: '根据标题生成视频文案', cat: '视频文案', icon: '🎥' },
  { title: '短视频脚本', desc: '帮你进行短视频的分镜文案脚本创作', cat: '视频文案', icon: '🎬' },
  { title: '视频口播稿', desc: '口播稿撰写指南', cat: '视频文案', icon: '🎤' },
  { title: '直播间话术整理', desc: '帮您整理直播间话术，简单又实用。', cat: '视频文案
