(function () {
  'use strict';

  var recipes = {
    noodles: {
      title: '1. Upgraded Instant Noodles',
      image: 'cookbook_assets/IMG_0114.jpg',
      meta: '<strong>Prep time:</strong> 2 mins | <strong>Cook time:</strong> 5 mins | <strong>Servings:</strong> 1 (easily doubled)',
      ingredients: [
        '1 pack instant noodles (with seasoning packet)',
        '<strong>2 cups</strong> water (<em>Use 4 cups for 2 noodle packs</em>)',
        '¼ cup mayonnaise',
        '¼ cup mustard',
        '⅓ cup hot sauce',
        '1 beef stick, sliced',
        '½ cup your favorite chips, crushed'
      ],
      instructions: [
        '<strong>Boil:</strong> Bring water to a boil in a small pot. Add the noodles and cook for <strong>3 to 5 minutes</strong> until tender.',
        '<strong>Drain:</strong> Carefully drain all the water from the pot.',
        '<strong>Sauce &amp; Season:</strong> Add the noodle seasoning packet, mayonnaise, mustard, and hot sauce directly to the noodles. Stir until well combined.',
        '<strong>Top &amp; Serve:</strong> Mix in the sliced beef stick and sprinkle crushed chips on top for extra crunch. Serve warm!'
      ]
    },
    salmon: {
      title: '2. Salmon Patties & Rice',
      image: 'cookbook_assets/salmon-patties-rice.jpg',
      meta: '<strong>Prep time:</strong> 10 mins | <strong>Cook time:</strong> 12 mins | <strong>Servings:</strong> 2',
      ingredients: [
        '1 can salmon, drained',
        '½ cup breadcrumbs',
        '1 egg',
        'Seasonings to taste',
        '2 cups cooked rice'
      ],
      instructions: [
        '<strong>Mix:</strong> Combine the salmon, breadcrumbs, egg, and seasonings.',
        '<strong>Shape:</strong> Form the mixture into small patties.',
        '<strong>Cook:</strong> Pan-fry both sides until golden and cooked through.',
        '<strong>Serve:</strong> Plate the patties over warm rice.'
      ]
    },
    'egg-bread': {
      title: '3. Egg & Bread with Syrup',
      image: 'cookbook_assets/IMG_0421.jpg',
      meta: '<strong>Prep time:</strong> 2 mins | <strong>Cook time:</strong> 5 mins | <strong>Servings:</strong> 1',
      ingredients: [
        '2 slices bread',
        '1 egg',
        'Butter',
        'Syrup',
        'Cheese (optional)'
      ],
      instructions: [
        '<strong>Toast:</strong> Toast and butter the bread.',
        '<strong>Fry:</strong> Cook the egg to your liking.',
        '<strong>Build:</strong> Place the egg and optional cheese on the toast.',
        '<strong>Finish:</strong> Drizzle with syrup and serve warm.'
      ]
    }
  };

  var modal = document.getElementById('recipeModal');
  var content = document.getElementById('recipeModalContent');
  var closeButton = document.getElementById('recipeClose');
  var lastTrigger = null;

  if (!modal || !content || !closeButton) return;

  function list(items, ordered) {
    var tag = ordered ? 'ol' : 'ul';
    return '<' + tag + '>' + items.map(function (item) {
      return '<li>' + item + '</li>';
    }).join('') + '</' + tag + '>';
  }

  function openRecipe(recipeId, trigger) {
    var recipe = recipes[recipeId];
    if (!recipe) return;

    lastTrigger = trigger;
    content.innerHTML =
      '<div class="recipe-layout">' +
      '  <div class="recipe-media">' +
      '    <img src="' + recipe.image + '" alt="' + recipe.title + '" />' +
      '  </div>' +
      '  <div class="recipe-details">' +
      '    <p class="recipe-kicker">Pain Heals Cookbook</p>' +
      '    <h2 id="recipeModalTitle">' + recipe.title + '</h2>' +
      '    <p class="recipe-meta">' + recipe.meta + '</p>' +
      '    <h3>Ingredients</h3>' +
      list(recipe.ingredients, false) +
      '    <h3>Instructions</h3>' +
      list(recipe.instructions, true) +
      '    <button type="button" class="recipe-dismiss">Close</button>' +
      '  </div>' +
      '</div>';

    modal.classList.remove('hidden');
    document.body.classList.add('recipe-modal-open');
    closeButton.focus();

    var dismissButton = content.querySelector('.recipe-dismiss');
    if (dismissButton) {
      dismissButton.addEventListener('click', closeRecipe);
    }
  }

  function closeRecipe() {
    modal.classList.add('hidden');
    document.body.classList.remove('recipe-modal-open');
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll('.recipe-open').forEach(function (button) {
    button.addEventListener('click', function () {
      openRecipe(button.dataset.recipe, button);
    });
  });

  closeButton.addEventListener('click', closeRecipe);

  modal.addEventListener('click', function (event) {
    if (event.target === modal) closeRecipe();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeRecipe();
    }
  });
})();
