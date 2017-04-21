# Responsive jQuery Slider

[![npm](https://img.shields.io/npm/v/codezero-jquery-slider.svg)](https://www.npmjs.com/package/codezero-jquery-slider)
[![npm](https://img.shields.io/npm/dt/codezero-jquery-slider.svg)](https://www.npmjs.com/package/codezero-jquery-slider)
[![npm](https://img.shields.io/npm/l/codezero-jquery-slider.svg)](https://www.npmjs.com/package/codezero-jquery-slider)

[View Demo](https://codezero-be.github.io/jquery-slider/) - [Tinker with CodePen](https://codepen.io/ivanvermeyen/pen/yMWvOR)

Is this the best, most advanced slider out there? No, not at all…
But even with all its features, the slider I was using before didn’t do exactly what I was looking for. So here we are.

## The main goal of this slider is to…
- be able to horizontally traverse through slides,
- allow any HTML content in a slide,
- also be an image slider right out of the box,
- allow slides with fixed and auto widths and heights,
- move 1 slide at a time and center it in the viewport,
- move 70% of the viewport, if the widest slide is less than 30%,
- align slides left, center or right when the viewport is wider than the slides,
- make all of this as customizable as possible…

## Contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic Setup](#basic-setup)
  - [Slide Backgrounds](#slide-backgrounds)
  - [Slide Overlays](#slide-overlays)
  - [Image Slides](#image-slides)
    - [Auto Width Image Slides](#auto-width-image-slides)
    - [Full Width Image Slides](#full-width-image-slides)
    - [Covered Width Image Slides](#covered-width-image-slides)
    - [Image Hover Overlay](#image-hover-overlay)
    - [Image Caption](#image-caption)
- [Options](#options)
- [Development](#development)
- [License](#license)

## Requirements
- [jQuery](https://jquery.com/)
- [jQuery.scrollTo](https://github.com/flesler/jquery.scrollTo)
- [jQuery-Touch-Events](https://github.com/benmajor/jQuery-Touch-Events) (if you want swiping)
- Modern browser (**not** IE 9 or less)

## Installation

### Via Bower
```
bower install codezero-jquery-slider --save
```

### Via NPM
```
npm install codezero-jquery-slider --save
```

### Include JS and CSS
```html
<!-- Important slider styling -->
<link rel="stylesheet" href="css/slider.min.css">

<!-- Required 3rd party scripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-scrollTo/2.1.0/jquery.scrollTo.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-touch-events/1.0.8/jquery.mobile-events.js"></script>

<!-- Slider script -->
<script src="js/slider.min.js"></script>

<!-- Kickoff the slider -->
<script>
    $('.slider').slide();
</script>
```

## Usage

### Basic Setup
The following snippet is the base skeleton of a slider.

```html
<div class="slider">

    <a href="#" class="slider-prev">&langle;</a>
    <a href="#" class="slider-next">&rangle;</a>

    <div class="slider-viewport">
        <div class="slider-track">

            <div class="slide">
                <!-- Slide Content -->
            </div>

        </div>
    </div>

</div>
```

By default, each slide will have an **auto width and height**.
You can specify a fixed width and height in CSS yourself,
or [change some variables](https://github.com/codezero-be/jquery-slider/blob/master/src/scss/_variables.scss) if you are compiling SCSS.

If you want every slide to take up 100% width of the viewport, simply add the `slide-full-width` class to the `.slider`.
Or if you want only specific slides to be 100% wide, you can add the `slide-full-width` class to that `.slide`.
The latter is probably less useful...

The slide content can really be anything. Paragraphs, headings, images, ... Style it however you want.

Remember the `.slide` is a `flex` child, so you might want to wrap your content
in another `<div>` for easier styling or positioning...

### Slide Backgrounds
You can [change some variables](https://github.com/codezero-be/jquery-slider/blob/master/src/scss/_variables.scss) to choose default backgrounds for your slides,
write your own styles or use a `data-background` attribute to set a specific background image on a slide.

If you want the background to zoom in when you hover over it, use `data-zoom-background` instead.
You can set your own zoom effect in the [variables file](https://github.com/codezero-be/jquery-slider/blob/master/src/scss/_variables.scss),
as long as it's a valid CSS `transform` value.

```html
<div class="slider slide-full-width">

    <a href="#" class="slider-prev">&langle;</a>
    <a href="#" class="slider-next">&rangle;</a>

    <div class="slider-viewport">
        <div class="slider-track">

            <div class="slide" data-background="path/to/bg-image.jpg">
                <!-- Slide Content -->
            </div>

        </div>
    </div>

</div>
```

### Slide Overlays
To add a color overlay on top of the background image, wrap your slide content in a `<div>` with the `slide-overlay` class.

```html
<div class="slider slide-full-width">

    <a href="#" class="slider-prev">&langle;</a>
    <a href="#" class="slider-next">&rangle;</a>

    <div class="slider-viewport">
        <div class="slider-track">

            <div class="slide" data-background="path/to/bg-image.jpg">
                <div class="slide-overlay">
                    <!-- Slide Content -->
                </div>
            </div>

        </div>
    </div>

</div>
```

### Image Slides
Image slides have specific markup and default styling out of the box.
The only thing you might want to hook up yourself is any lightbox you prefer.

#### Auto Width Image Slides
To restrain the image size, you might want to specify a `max-height` for the `<img>`.
If you set the `$slide-height` [variable in SCSS](https://github.com/codezero-be/jquery-slider/blob/master/src/scss/_variables.scss),
this is done automatically.

```html
<div class="slider">

    <a href="#" class="slider-prev">&langle;</a>
    <a href="#" class="slider-next">&rangle;</a>

    <div class="slider-viewport">
        <div class="slider-track">

            <div class="slide">
                <a href="path/to/original-image.jpg" class="slide-image">
                    <img src="path/to/image-thumb.jpg">
                </a>
            </div>

        </div>
    </div>

</div>
```

> Note that the `.slide-image` doesn't have to be a link.
> It can also just be a `<div>`.

#### Full Width Image Slides
Again, you can make each slide full width by adding the `slide-full-width` class.
The clickable `.slide-image` element will be centered inside the slide.

```html
<div class="slider slide-full-width">

    <a href="#" class="slider-prev">&langle;</a>
    <a href="#" class="slider-next">&rangle;</a>

    <div class="slider-viewport">
        <div class="slider-track">

            <div class="slide">
                <a href="path/to/original-image.jpg" class="slide-image">
                    <img src="path/to/image-thumb.jpg">
                </a>
            </div>

        </div>
    </div>

</div>
```

#### Covered Width Image Slides
To make the `.slide-image` element also full width, replace the `slide-full-width` class with `slide-cover-width`. 
Now only the image is still centered inside the `.slide-image` element, which makes sense since we don't want to stretch it out.

However, to set the image as a background, covering the entire slide,
simply add the `slide-image-background` class to the `<img>`.
Note that this will probably crop the image to fit the slides dimensions.

```html
<div class="slider slide-cover-width">

    <a href="#" class="slider-prev">&langle;</a>
    <a href="#" class="slider-next">&rangle;</a>

    <div class="slider-viewport">
        <div class="slider-track">

            <div class="slide">
                <a href="path/to/original-image.jpg" class="slide-image">
                    <img src="path/to/image-thumb.jpg" class="slide-image-background">
                </a>
            </div>

        </div>
    </div>

</div>
```

#### Image Hover Overlay
Want to show a zoom icon when you hover over the image? Just add it...

```html
<div class="slide">
    <a href="path/to/original-image.jpg" class="slide-image">
        <!-- Note: this icon requires Font Awesome... -->
        <!-- Use any library you like... -->
        <i class="fa fa-search-plus slide-image-hoverlay"></i>
        <img src="path/to/image-thumb.jpg">
    </a>
</div>
```
 
 Or just show some text...
 
```html
<div class="slide">
    <a href="path/to/original-image.jpg" class="slide-image">
        <span class="slide-image-hoverlay">VIEW</span>
        <img src="path/to/image-thumb.jpg">
    </a>
</div>
```

#### Image Caption
Same as the hoverlay, if you would like to display an image caption, just add the element...

```html
<div class="slide">
    <a href="path/to/original-image.jpg" class="slide-image">
        <img src="path/to/image-thumb.jpg">
        <span class="slide-image-caption">
            Beautiful example image!
        </span>
    </a>
</div>
```

## Options
If you are using SASS/SCSS, there are a bunch of variables you can tweak to change the behavior of the slider.
I have added comments, so I hope it will be clear what each option will do.
Just take a look at the [variables file](https://github.com/codezero-be/jquery-slider/blob/master/src/scss/_variables.scss).

The javascript side also has some options. These are also commented so I would again suggest to
take a look at the `defaults` object in the [javascript source file](https://github.com/codezero-be/jquery-slider/blob/master/src/js/slider.js).

Overriding the defaults would take the form of:

```javascript
$('.slider').slide({
    slideSpeed: 300,
    enableSwipe: false
});
```

## Development
I am using a tool called [Laravel Mix](https://github.com/JeffreyWay/laravel-mix) to compile javascript and SCSS.
Make sure you have the latest version of [NodeJS](https://nodejs.org/en/) installed and then run `npm install`.

- To compile run `npm run dev`.
- To compile and watch for changes run `npm run watch`.
- To compile for production (minify/uglify) run `npm run production`.

## License
The MIT License (MIT). Please see [License File](https://github.com/codezero-be/jquery-slider/blob/master/LICENSE.md) for more information.

---
[![Analytics](https://ga-beacon.appspot.com/UA-58876018-1/codezero-be/jquery-slider)](https://github.com/igrigorik/ga-beacon)
