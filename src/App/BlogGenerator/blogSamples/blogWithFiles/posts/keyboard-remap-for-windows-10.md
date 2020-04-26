---
tags: [technology]
title: This one has images
description: Keyboard remaps for Windows 10
date: 2020-11-20
---

![Junior tu papa](require(/junior.png))

I really like the idea of not using my mouse or trackpad when using my laptop, so I'm always looking for ways to leverage this task to the keyboard.

When I bought my Macbook Pro in 2013, even though it has an amazing trackpad with very useful and intuitive gestures, most of the times I was working using an external mechanical keyboard and a mouse.

![Barca](require(/barca.gif))

That's why I started looking for solutions to this problem and that's when I first found [Karabiner](https://github.com/tekezo/Karabiner), which at the time was the best Keyboard Key remapper for Mac with infinite customization. I spent a lot of time configuring it and ended up with a solution that I really liked.

Everything was going well, until I needed to upgrade my laptop. It was 2017 and I was considering buying another Macbook Pro since the one I got was kind of old and I needed a more performant machine. The new Macbooks were not something I was expecting and after some watching many tech reviews on them, I found they were really bad. Horrible keyboard, no esc key, no function keys, a useless touchbar, bad specs, super expensive, etc. 

I waited a couple of years for the new Macbooks but they weren't getting any better. I didn't know what to do at the momment, I loved MacOS, it has been working so well for me, especially for web and app development, that it was going to be very hard moving away from it to a new Operating System.

It may seem that I'm not familiar with other OSes but actually I grew up using Windows, and have worked with Linux too. so I knew what is going on over there. I started looking for Windows 10 as a potential replacement but it just wasn't the same. All the shortcuts, gestures, beautiful animations and transitions that MacOS brings to the table can't be found anywhere else. But I was ready to give up all of that and start over again. 

The first thing I tried to do was to emulate all of the shortcuts I had on my Mac. Things like copy-paste, edit texts, take and edit screenshots, switch applications and windows were kind of hard to replicate. I tried using a nice program called `AutoHotkey`, which can do a lot in terms of remapping keys and other useful script automation tasks, but after using it for a while, some problems started to arise. Sometimes the app key remaps stops working, some special keys like the Windows Key was too buggy when remapped to something else. So after giving that up as well I didn't found any other tool that can help me with it so I decided to create my own program for that. 

[InterceptionKeyRemapper](https://github.com/goerwin/interception-keyremapper) is a low level program that I made, written in C++ that in conjuntion with Interception, which is a Keyboard key interception at the driver level, solved my problem.