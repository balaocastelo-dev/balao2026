
import gsap from 'gsap';

/**
 * Animates an item flying into the cart.
 * @param startElement The element to start the animation from (e.g., the product image or button).
 * @param imageUrl The URL of the image to fly.
 * @param targetSelector The CSS selector for the target element (default: '#cart-icon-container').
 */
export const animateAddToCart = (
  startElement: HTMLElement | null,
  imageUrl: string,
  targetSelector: string = '#cart-icon-container'
) => {
  if (!startElement) return;

  const target = document.querySelector(targetSelector);
  if (!target) return;

  // Create the flying image
  const flyingImage = document.createElement('img');
  flyingImage.src = imageUrl;
  flyingImage.style.position = 'fixed';
  flyingImage.style.zIndex = '9999';
  flyingImage.style.pointerEvents = 'none';
  flyingImage.style.borderRadius = '50%';
  flyingImage.style.objectFit = 'cover';
  
  // Get initial position and dimensions
  const startRect = startElement.getBoundingClientRect();
  const initialSize = Math.min(startRect.width, 100);
  
  flyingImage.style.width = `${initialSize}px`;
  flyingImage.style.height = `${initialSize}px`;
  
  // Set initial position centered on start element
  // We use top/left for position and translate(-50%, -50%) for centering pivot
  flyingImage.style.left = `${startRect.left + (startRect.width / 2)}px`;
  flyingImage.style.top = `${startRect.top + (startRect.height / 2)}px`;
  flyingImage.style.transform = 'translate(-50%, -50%)';

  document.body.appendChild(flyingImage);

  // Get target center position
  const targetRect = target.getBoundingClientRect();
  const targetCenterX = targetRect.left + (targetRect.width / 2);
  const targetCenterY = targetRect.top + (targetRect.height / 2);

  // Calculate distance to travel relative to current position
  // Since we are using translate(-50%, -50%) and left/top is at center, 
  // we just need to animate left/top to the new center.
  
  const timeline = gsap.timeline({
    onComplete: () => {
      if (flyingImage.parentNode) {
        flyingImage.parentNode.removeChild(flyingImage);
      }
    }
  });

  // 1. Fly to cart (Genie Effect)
  timeline.to(flyingImage, {
    duration: 0.8,
    left: targetCenterX,
    top: targetCenterY,
    width: 20, // Shrink to almost nothing
    height: 20,
    opacity: 0, // Fade out as it enters
    ease: "power2.inOut", // Smooth acceleration/deceleration
  });

  // 2. Cart "Swallow" Effect (Anticipation and Gulp)
  // Starts slightly before the item arrives (-=0.3)
  timeline.to(target, {
    scale: 1.3,
    duration: 0.2,
    ease: "power1.out"
  }, "-=0.3"); // Open mouth (grow) as item approaches

  // 3. Cart returns to normal (Swallow complete)
  timeline.to(target, {
    scale: 1,
    rotation: 0,
    duration: 0.3,
    ease: "elastic.out(1, 0.5)" // Satisfying bounce back
  });
};
