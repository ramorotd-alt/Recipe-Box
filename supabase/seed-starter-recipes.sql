-- Seed the six original homepage recipes across Tirore, Tirori, and Tiroro.
-- Run once in the Supabase SQL Editor. Does not drop tables.
-- Skips a recipe if that cook already has the same title.

with cooks as (
  select id, username
  from public.profiles
  where username in (
    'tirore_fdacbfdf',
    'tirori_ca9b41d6',
    'tiroro_05589ecf'
  )
),
seed as (
  select *
  from (
    values
      (
        'tirore_fdacbfdf',
        'Lemon herb roast chicken',
        'Weeknight roast with garlic, thyme, and a bright pan sauce.',
        array[
          '1 whole chicken (about 1.5 kg)',
          '1 lemon',
          '4 garlic cloves',
          'A few sprigs of thyme',
          'Olive oil',
          'Salt and pepper'
        ],
        70,
        'easy',
        'Dinner',
        array[
          'Heat the oven to 200C.',
          'Rub the chicken with oil, salt, garlic, and thyme.',
          'Roast for about 55 minutes, until the juices run clear.',
          'Rest, then serve with the pan sauce and lemon.'
        ]
      ),
      (
        'tirore_fdacbfdf',
        'Tomato basil pasta',
        'A handful of ingredients, ripe tomatoes, and a lot of basil.',
        array[
          '300g pasta',
          '4 ripe tomatoes',
          '2 garlic cloves',
          'A handful of basil',
          'Olive oil',
          'Salt'
        ],
        30,
        'easy',
        'Italian',
        array[
          'Boil the pasta in salted water.',
          'Cook garlic in olive oil, then add chopped tomatoes.',
          'Toss with pasta and torn basil.'
        ]
      ),
      (
        'tirori_ca9b41d6',
        'Overnight oats with berries',
        'Stir it at night, eat it in the morning. No cooking required.',
        array[
          '1 cup rolled oats',
          '1 cup milk or oat milk',
          '1 tablespoon chia seeds',
          'A handful of berries',
          'Honey or maple syrup'
        ],
        8,
        'easy',
        'Breakfast',
        array[
          'Mix oats, milk, and chia in a jar.',
          'Chill overnight.',
          'Top with berries and a little honey.'
        ]
      ),
      (
        'tirori_ca9b41d6',
        'Chickpea coconut curry',
        'Creamy, spiced, and ready in one pot with pantry staples.',
        array[
          '1 can chickpeas',
          '1 can coconut milk',
          '1 onion',
          '2 garlic cloves',
          '1 tablespoon curry powder',
          'Salt'
        ],
        42,
        'medium',
        'Dinner',
        array[
          'Soften the onion and garlic in a pot.',
          'Stir in curry powder, chickpeas, and coconut milk.',
          'Simmer about 20 minutes and season with salt.'
        ]
      ),
      (
        'tiroro_05589ecf',
        'Olive oil cake',
        'Tender crumb, citrus zest, and a dusting of powdered sugar.',
        array[
          '200g flour',
          '150g sugar',
          '3 eggs',
          '120ml olive oil',
          'Zest of 1 lemon',
          '1 teaspoon baking powder'
        ],
        60,
        'medium',
        'Dessert',
        array[
          'Heat the oven to 175C and grease a cake tin.',
          'Whisk eggs, sugar, oil, and lemon zest.',
          'Fold in flour and baking powder.',
          'Bake about 40 minutes. Cool and dust with sugar.'
        ]
      ),
      (
        'tiroro_05589ecf',
        'Shakshuka',
        'Eggs poached in a pepper-tomato sauce. Serve with bread.',
        array[
          '1 onion',
          '1 red pepper',
          '2 garlic cloves',
          '1 can tomatoes',
          '4 eggs',
          'Paprika, salt, and bread to serve'
        ],
        35,
        'easy',
        'Breakfast',
        array[
          'Cook onion, pepper, and garlic until soft.',
          'Add tomatoes and paprika. Simmer until thick.',
          'Make wells, crack in the eggs, and cook until just set.',
          'Serve with bread.'
        ]
      )
  ) as rows(
    username,
    title,
    description,
    ingredients,
    cooking_time,
    difficulty,
    category,
    instructions
  )
)
insert into public.recipes (
  user_id,
  title,
  description,
  ingredients,
  cooking_time,
  difficulty,
  category,
  instructions
)
select
  cooks.id,
  seed.title,
  seed.description,
  seed.ingredients,
  seed.cooking_time,
  seed.difficulty,
  seed.category,
  seed.instructions
from seed
join cooks on cooks.username = seed.username
where not exists (
  select 1
  from public.recipes existing
  where existing.user_id = cooks.id
    and existing.title = seed.title
);
