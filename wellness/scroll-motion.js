(() => {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 801px)');
  if (reduceMotion.matches || !desktop.matches) return;

  document.body.classList.add('scroll-system-ready');
  ScrollTrigger.config({ ignoreMobileResize: true });

  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => gsap.utils.toArray(selector, root);
  const triggers = [];
  const remember = animation => {
    const trigger = animation?.scrollTrigger || animation;
    if (trigger) triggers.push(trigger);
    return animation;
  };

  /* 01 · Hero: stable composition, only the numbered specimen has depth. */
  const hero = q('.hero');
  const heroArt = q('.hero-art');
  if (hero && heroArt) {
    remember(gsap.to(heroArt, {
      '--specimen-scroll': '-56px',
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 }
    }));
    remember(gsap.to('.scroll-mark', {
      autoAlpha: 0,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: '35% top', scrub: .5 }
    }));
  }

  /* 02 · Shiatsu: a short fixed idea while the explanation advances. */
  const bridge = q('.bridge');
  const bridgeIntro = q('.bridge-intro');
  const pressureStage = q('.pressure-stage');
  if (bridge && bridgeIntro && pressureStage) {
    remember(ScrollTrigger.create({
      trigger: bridgeIntro,
      start: 'top 96px',
      end: () => `+=${Math.min(340, innerHeight * .46)}`,
      pin: bridgeIntro,
      pinSpacing: true,
      anticipatePin: 1
    }));

    const pressureTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: pressureStage,
        start: 'top 86%',
        end: 'center 42%',
        scrub: 1
      }
    });
    pressureTimeline
      .fromTo('.pressure-a', { scale: .55, autoAlpha: .18 }, { scale: 1, autoAlpha: .86, ease: 'none' }, 0)
      .fromTo('.pressure-b', { scale: .68, autoAlpha: .14 }, { scale: 1, autoAlpha: .68, ease: 'none' }, .12)
      .fromTo('.pressure-c', { scale: .78, autoAlpha: .1 }, { scale: 1, autoAlpha: .5, ease: 'none' }, .24);
    remember(pressureTimeline);
  }

  /* 03 · Sensory pause: the dark surface covers the previous chapter. */
  const sensory = q('.sensory');
  if (sensory) {
    remember(gsap.to(sensory, {
      clipPath: 'inset(0% 0 0 0)',
      ease: 'none',
      scrollTrigger: { trigger: sensory, start: 'top bottom', end: 'top top', scrub: 1 }
    }));
    remember(gsap.fromTo('.sensory-image img',
      { yPercent: -7, scale: 1.1 },
      { yPercent: 7, scale: 1.1, ease: 'none', scrollTrigger: { trigger: sensory, start: 'top bottom', end: 'bottom top', scrub: 1.2 } }
    ));
  }

  /* 04 · Orientador: a single composition opens from its central seam. */
  const guide = q('.guide');
  if (guide) {
    const guideTimeline = gsap.timeline({
      scrollTrigger: { trigger: guide, start: 'top 88%', end: 'top 30%', scrub: .8 }
    });
    guideTimeline
      .fromTo('.guide-art', { clipPath: 'inset(0 0 0 18%)', autoAlpha: .45 }, { clipPath: 'inset(0 0 0 0%)', autoAlpha: 1, ease: 'none' }, 0)
      .fromTo('.guide-panel', { clipPath: 'inset(0 18% 0 0)', autoAlpha: .45 }, { clipPath: 'inset(0 0% 0 0)', autoAlpha: 1, ease: 'none' }, 0);
    remember(guideTimeline);
  }

  /* 05 · Sessions: chapter index appears in grid order. */
  const introItems = qa('.services-intro > .kicker, .services-intro > h2, .services-intro > p:last-child');
  if (introItems.length) {
    const introTimeline = gsap.timeline({
      scrollTrigger: { trigger: '.services-intro', start: 'top 82%', end: 'center 52%', scrub: .7 }
    });
    introTimeline.fromTo(introItems,
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: .13, ease: 'none' }
    );
    remember(introTimeline);
  }

  /* 06–07 · Both services share one system: fixed archive, moving content. */
  qa('.service-chapter').forEach(chapter => {
    const archive = q('.service-archive', chapter);
    const image = q('.service-image-window img', chapter);
    if (!archive) return;

    remember(ScrollTrigger.create({
      trigger: chapter,
      start: 'top 92px',
      end: 'bottom bottom-=112',
      pin: archive,
      pinSpacing: false,
      anticipatePin: 1
    }));

    if (image) {
      remember(gsap.fromTo(image,
        { yPercent: -4, scale: 1.055 },
        { yPercent: 4, scale: 1.055, ease: 'none', scrollTrigger: { trigger: chapter, start: 'top bottom', end: 'bottom top', scrub: 1 } }
      ));
    }

    if (chapter.classList.contains('service-corporal')) {
      remember(gsap.to(archive, {
        '--specimen-scroll': '-42px',
        ease: 'none',
        scrollTrigger: { trigger: chapter, start: 'top bottom', end: 'bottom top', scrub: 1 }
      }));
    }
  });

  /* 08 · First visit: sober sequence, no pinning or parallax. */
  const firstVisit = q('.first-visit');
  if (firstVisit) {
    const firstBlocks = [
      q('.first-visit-heading'), q('.first-visit-archive'),
      ...qa('.first-visit-steps article'), q('.first-visit-profile'), q('.first-visit-notes')
    ].filter(Boolean);
    const firstTimeline = gsap.timeline({
      scrollTrigger: { trigger: firstVisit, start: 'top 84%', end: '55% 58%', scrub: .75 }
    });
    firstTimeline.fromTo(firstBlocks,
      { y: 24, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: .11, ease: 'none' }
    );
    remember(firstTimeline);
  }

  /* 09 · The second dark surface repeats the sensory transition. */
  const closing = q('.services-closing');
  if (closing) {
    remember(gsap.to(closing, {
      clipPath: 'inset(0% 0 0 0)',
      ease: 'none',
      scrollTrigger: { trigger: closing, start: 'top bottom', end: 'top top', scrub: 1 }
    }));
  }

  /* 10 · Booking deliberately remains motion-free. */
  const refresh = () => ScrollTrigger.refresh(true);
  document.fonts?.ready.then(refresh);
  addEventListener('load', refresh, { once: true });
  setTimeout(refresh, 450);

  reduceMotion.addEventListener?.('change', () => location.reload());
  desktop.addEventListener?.('change', () => location.reload());
})();
