<template>
  <div
    class="emoji-picker"
    :class="{ 'is-flipped': flipped }"
    ref="pickerEl"
    role="dialog"
    aria-label="Emoji picker"
    aria-modal="false">
    <!-- Search -->
    <div class="emoji-search-wrap">
      <label :for="searchId" class="sr-only">Search emoji</label>
      <input
        :id="searchId"
        ref="searchEl"
        v-model="query"
        type="search"
        class="emoji-search"
        placeholder="Search emoji…"
        autocomplete="off"
        @input="onSearch" />
    </div>

    <!-- Category tabs (hidden during search) -->
    <div v-if="!query" class="emoji-tabs" role="tablist" aria-label="Emoji categories">
      <button
        v-for="cat in categories"
        :key="cat.id"
        role="tab"
        type="button"
        class="emoji-tab"
        :class="{ active: activeCategory === cat.id }"
        :aria-selected="activeCategory === cat.id"
        :aria-label="cat.label"
        :title="cat.label"
        @click="activeCategory = cat.id">
        {{ cat.icon }}
      </button>
    </div>

    <!-- Emoji grid -->
    <div class="emoji-grid-wrap">
      <p v-if="query && filteredEmojis.length === 0" class="emoji-empty">
        No emoji found for "{{ query }}"
      </p>
      <div
        v-else
        class="emoji-grid"
        role="listbox"
        :aria-label="query ? 'Search results' : activeLabel">
        <button
          v-for="emoji in displayedEmojis"
          :key="emoji.emoji"
          type="button"
          class="emoji-btn"
          role="option"
          :aria-label="emoji.name"
          :title="emoji.name"
          @click="select(emoji.emoji)">
          {{ emoji.emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  select: [emoji: string]
  close: []
}>()

const searchId = useId()
const pickerEl = ref<HTMLElement>()
const flipped = ref(false)
const searchEl = ref<HTMLInputElement>()
const query = ref('')
const activeCategory = ref('smileys')

interface EmojiEntry { emoji: string; name: string; keywords?: string[] }
interface Category { id: string; label: string; icon: string; emojis: EmojiEntry[] }

const categories: Category[] = [
  {
    id: 'smileys',
    label: 'Smileys & People',
    icon: '😀',
    emojis: [
      { emoji: '😀', name: 'grinning face', keywords: ['happy', 'smile'] },
      { emoji: '😁', name: 'beaming face with smiling eyes', keywords: ['happy', 'grin'] },
      { emoji: '😂', name: 'face with tears of joy', keywords: ['laugh', 'lol'] },
      { emoji: '🤣', name: 'rolling on the floor laughing', keywords: ['rofl', 'laugh'] },
      { emoji: '😃', name: 'grinning face with big eyes', keywords: ['happy', 'smile'] },
      { emoji: '😄', name: 'grinning face with smiling eyes', keywords: ['happy'] },
      { emoji: '😅', name: 'grinning face with sweat', keywords: ['nervous'] },
      { emoji: '😆', name: 'grinning squinting face', keywords: ['laugh'] },
      { emoji: '😉', name: 'winking face', keywords: ['wink', 'flirt'] },
      { emoji: '😊', name: 'smiling face with smiling eyes', keywords: ['blush', 'happy'] },
      { emoji: '😋', name: 'face savoring food', keywords: ['yum', 'delicious'] },
      { emoji: '😎', name: 'smiling face with sunglasses', keywords: ['cool', 'sunglasses'] },
      { emoji: '😍', name: 'smiling face with heart-eyes', keywords: ['love', 'heart'] },
      { emoji: '🥰', name: 'smiling face with hearts', keywords: ['love', 'adore'] },
      { emoji: '😘', name: 'face blowing a kiss', keywords: ['kiss', 'love'] },
      { emoji: '😗', name: 'kissing face', keywords: ['kiss'] },
      { emoji: '😙', name: 'kissing face with smiling eyes', keywords: ['kiss'] },
      { emoji: '😚', name: 'kissing face with closed eyes', keywords: ['kiss'] },
      { emoji: '🙂', name: 'slightly smiling face', keywords: ['smile'] },
      { emoji: '🤗', name: 'hugging face', keywords: ['hug', 'warm'] },
      { emoji: '🤔', name: 'thinking face', keywords: ['think', 'hmm'] },
      { emoji: '🤨', name: 'face with raised eyebrow', keywords: ['suspicious', 'skeptical'] },
      { emoji: '😐', name: 'neutral face', keywords: ['neutral', 'meh'] },
      { emoji: '😑', name: 'expressionless face', keywords: ['blank'] },
      { emoji: '😶', name: 'face without mouth', keywords: ['silent'] },
      { emoji: '🙄', name: 'face with rolling eyes', keywords: ['eyeroll', 'whatever'] },
      { emoji: '😏', name: 'smirking face', keywords: ['smirk', 'smug'] },
      { emoji: '😣', name: 'persevering face', keywords: ['struggling'] },
      { emoji: '😥', name: 'sad but relieved face', keywords: ['sad', 'phew'] },
      { emoji: '😮', name: 'face with open mouth', keywords: ['wow', 'surprise'] },
      { emoji: '🤐', name: 'zipper-mouth face', keywords: ['quiet', 'secret'] },
      { emoji: '😯', name: 'hushed face', keywords: ['surprised'] },
      { emoji: '😪', name: 'sleepy face', keywords: ['tired', 'sleep'] },
      { emoji: '😫', name: 'tired face', keywords: ['exhausted'] },
      { emoji: '🥱', name: 'yawning face', keywords: ['yawn', 'tired'] },
      { emoji: '😴', name: 'sleeping face', keywords: ['sleep', 'zzz'] },
      { emoji: '😌', name: 'relieved face', keywords: ['peaceful', 'calm'] },
      { emoji: '😛', name: 'face with tongue', keywords: ['tongue', 'silly'] },
      { emoji: '😜', name: 'winking face with tongue', keywords: ['silly', 'playful'] },
      { emoji: '😝', name: 'squinting face with tongue', keywords: ['silly'] },
      { emoji: '🤤', name: 'drooling face', keywords: ['drool', 'hungry'] },
      { emoji: '😒', name: 'unamused face', keywords: ['meh', 'unimpressed'] },
      { emoji: '😓', name: 'downcast face with sweat', keywords: ['nervous'] },
      { emoji: '😔', name: 'pensive face', keywords: ['sad', 'thoughtful'] },
      { emoji: '😕', name: 'confused face', keywords: ['confused'] },
      { emoji: '🙃', name: 'upside-down face', keywords: ['silly', 'sarcasm'] },
      { emoji: '🤑', name: 'money-mouth face', keywords: ['money', 'rich'] },
      { emoji: '😲', name: 'astonished face', keywords: ['shocked', 'amazed'] },
      { emoji: '☹️', name: 'frowning face', keywords: ['sad', 'frown'] },
      { emoji: '🙁', name: 'slightly frowning face', keywords: ['sad'] },
      { emoji: '😖', name: 'confounded face', keywords: ['frustrated'] },
      { emoji: '😞', name: 'disappointed face', keywords: ['sad', 'disappointed'] },
      { emoji: '😟', name: 'worried face', keywords: ['worried', 'anxious'] },
      { emoji: '😤', name: 'face with steam from nose', keywords: ['angry', 'triumph'] },
      { emoji: '😢', name: 'crying face', keywords: ['cry', 'sad'] },
      { emoji: '😭', name: 'loudly crying face', keywords: ['sob', 'cry'] },
      { emoji: '😦', name: 'frowning face with open mouth', keywords: ['anguish'] },
      { emoji: '😧', name: 'anguished face', keywords: ['anguish'] },
      { emoji: '😨', name: 'fearful face', keywords: ['fear', 'scared'] },
      { emoji: '😩', name: 'weary face', keywords: ['exhausted', 'frustrated'] },
      { emoji: '🤯', name: 'exploding head', keywords: ['mindblown', 'shocked'] },
      { emoji: '😬', name: 'grimacing face', keywords: ['grimace', 'awkward'] },
      { emoji: '😰', name: 'anxious face with sweat', keywords: ['nervous', 'anxious'] },
      { emoji: '😱', name: 'face screaming in fear', keywords: ['scared', 'horror'] },
      { emoji: '🥵', name: 'hot face', keywords: ['hot', 'overheated'] },
      { emoji: '🥶', name: 'cold face', keywords: ['cold', 'freezing'] },
      { emoji: '😳', name: 'flushed face', keywords: ['embarrassed', 'blush'] },
      { emoji: '🤪', name: 'zany face', keywords: ['crazy', 'silly'] },
      { emoji: '😵', name: 'dizzy face', keywords: ['dizzy', 'confused'] },
      { emoji: '🥴', name: 'woozy face', keywords: ['drunk', 'dizzy'] },
      { emoji: '😠', name: 'angry face', keywords: ['angry', 'mad'] },
      { emoji: '😡', name: 'pouting face', keywords: ['angry', 'rage'] },
      { emoji: '🤬', name: 'face with symbols on mouth', keywords: ['angry', 'swearing'] },
      { emoji: '😷', name: 'face with medical mask', keywords: ['sick', 'mask'] },
      { emoji: '🤒', name: 'face with thermometer', keywords: ['sick', 'ill'] },
      { emoji: '🤕', name: 'face with head-bandage', keywords: ['hurt', 'injured'] },
      { emoji: '🤢', name: 'nauseated face', keywords: ['sick', 'gross'] },
      { emoji: '🤮', name: 'face vomiting', keywords: ['sick', 'vomit'] },
      { emoji: '🤧', name: 'sneezing face', keywords: ['sneeze', 'sick'] },
      { emoji: '🥳', name: 'partying face', keywords: ['party', 'celebrate'] },
      { emoji: '🥸', name: 'disguised face', keywords: ['disguise', 'incognito'] },
      { emoji: '🥺', name: 'pleading face', keywords: ['please', 'puppy eyes'] },
      { emoji: '🤩', name: 'star-struck', keywords: ['star', 'amazing'] },
      { emoji: '😇', name: 'smiling face with halo', keywords: ['angel', 'innocent'] },
      { emoji: '🤠', name: 'cowboy hat face', keywords: ['cowboy', 'western'] },
      { emoji: '🤡', name: 'clown face', keywords: ['clown'] },
      { emoji: '🤥', name: 'lying face', keywords: ['liar', 'pinocchio'] },
      { emoji: '🤫', name: 'shushing face', keywords: ['quiet', 'shush'] },
      { emoji: '🤭', name: 'face with hand over mouth', keywords: ['oops', 'surprise'] },
      { emoji: '🧐', name: 'face with monocle', keywords: ['curious', 'fancy'] },
      { emoji: '😈', name: 'smiling face with horns', keywords: ['devil', 'mischief'] },
      { emoji: '👿', name: 'angry face with horns', keywords: ['devil', 'angry'] },
      { emoji: '💀', name: 'skull', keywords: ['death', 'dead'] },
      { emoji: '👻', name: 'ghost', keywords: ['ghost', 'halloween'] },
      { emoji: '👾', name: 'alien monster', keywords: ['game', 'alien'] },
      { emoji: '🤖', name: 'robot', keywords: ['robot', 'bot'] },
      { emoji: '💩', name: 'pile of poo', keywords: ['poop', 'funny'] },
      { emoji: '👋', name: 'waving hand', keywords: ['wave', 'hello', 'hi'] },
      { emoji: '🤚', name: 'raised back of hand', keywords: ['hand', 'stop'] },
      { emoji: '✋', name: 'raised hand', keywords: ['hand', 'stop', 'high five'] },
      { emoji: '🖐️', name: 'hand with fingers splayed', keywords: ['hand'] },
      { emoji: '👌', name: 'ok hand', keywords: ['ok', 'perfect'] },
      { emoji: '✌️', name: 'victory hand', keywords: ['peace', 'v'] },
      { emoji: '🤞', name: 'crossed fingers', keywords: ['luck', 'hope'] },
      { emoji: '🤟', name: 'love-you gesture', keywords: ['love', 'ily'] },
      { emoji: '🤘', name: 'sign of the horns', keywords: ['rock', 'metal'] },
      { emoji: '👈', name: 'backhand index pointing left', keywords: ['left', 'point'] },
      { emoji: '👉', name: 'backhand index pointing right', keywords: ['right', 'point'] },
      { emoji: '👆', name: 'backhand index pointing up', keywords: ['up', 'point'] },
      { emoji: '👇', name: 'backhand index pointing down', keywords: ['down', 'point'] },
      { emoji: '☝️', name: 'index pointing up', keywords: ['up', 'one'] },
      { emoji: '👍', name: 'thumbs up', keywords: ['like', 'good', 'yes'] },
      { emoji: '👎', name: 'thumbs down', keywords: ['dislike', 'no', 'bad'] },
      { emoji: '✊', name: 'raised fist', keywords: ['fist', 'power'] },
      { emoji: '👊', name: 'oncoming fist', keywords: ['punch', 'fist'] },
      { emoji: '🤛', name: 'left-facing fist', keywords: ['fist bump'] },
      { emoji: '🤜', name: 'right-facing fist', keywords: ['fist bump'] },
      { emoji: '👏', name: 'clapping hands', keywords: ['clap', 'applause'] },
      { emoji: '🙌', name: 'raising hands', keywords: ['celebrate', 'hooray'] },
      { emoji: '👐', name: 'open hands', keywords: ['open', 'hug'] },
      { emoji: '🤲', name: 'palms up together', keywords: ['pray', 'offer'] },
      { emoji: '🤝', name: 'handshake', keywords: ['deal', 'agreement'] },
      { emoji: '🙏', name: 'folded hands', keywords: ['pray', 'please', 'thanks'] },
      { emoji: '💪', name: 'flexed biceps', keywords: ['strong', 'muscle'] },
      { emoji: '🦾', name: 'mechanical arm', keywords: ['robot', 'strong'] },
      { emoji: '❤️', name: 'red heart', keywords: ['love', 'heart'] },
      { emoji: '🧡', name: 'orange heart', keywords: ['love', 'heart'] },
      { emoji: '💛', name: 'yellow heart', keywords: ['love', 'heart'] },
      { emoji: '💚', name: 'green heart', keywords: ['love', 'heart'] },
      { emoji: '💙', name: 'blue heart', keywords: ['love', 'heart'] },
      { emoji: '💜', name: 'purple heart', keywords: ['love', 'heart'] },
      { emoji: '🖤', name: 'black heart', keywords: ['love', 'heart'] },
      { emoji: '🤍', name: 'white heart', keywords: ['love', 'heart'] },
      { emoji: '🤎', name: 'brown heart', keywords: ['love', 'heart'] },
      { emoji: '💔', name: 'broken heart', keywords: ['heartbreak', 'sad'] },
      { emoji: '💯', name: 'hundred points', keywords: ['100', 'perfect', 'score'] },
      { emoji: '💢', name: 'anger symbol', keywords: ['angry', 'comic'] },
      { emoji: '💥', name: 'collision', keywords: ['boom', 'explosion'] },
      { emoji: '💫', name: 'dizzy', keywords: ['dizzy', 'stars'] },
      { emoji: '💦', name: 'sweat droplets', keywords: ['sweat', 'water'] },
      { emoji: '💨', name: 'dashing away', keywords: ['fast', 'wind'] },
      { emoji: '🕳️', name: 'hole', keywords: ['hole'] },
      { emoji: '💬', name: 'speech balloon', keywords: ['chat', 'comment'] },
      { emoji: '👁️‍🗨️', name: 'eye in speech bubble', keywords: ['see', 'witness'] },
      { emoji: '🗯️', name: 'right anger bubble', keywords: ['angry', 'comic'] },
      { emoji: '💭', name: 'thought balloon', keywords: ['think', 'thought'] },
      { emoji: '💤', name: 'zzz', keywords: ['sleep', 'tired'] },
    ],
  },
  {
    id: 'animals',
    label: 'Animals & Nature',
    icon: '🐶',
    emojis: [
      { emoji: '🐶', name: 'dog face', keywords: ['dog', 'puppy'] },
      { emoji: '🐱', name: 'cat face', keywords: ['cat', 'kitten'] },
      { emoji: '🐭', name: 'mouse face', keywords: ['mouse'] },
      { emoji: '🐹', name: 'hamster face', keywords: ['hamster'] },
      { emoji: '🐰', name: 'rabbit face', keywords: ['rabbit', 'bunny'] },
      { emoji: '🦊', name: 'fox face', keywords: ['fox'] },
      { emoji: '🐻', name: 'bear face', keywords: ['bear'] },
      { emoji: '🐼', name: 'panda face', keywords: ['panda'] },
      { emoji: '🐨', name: 'koala', keywords: ['koala'] },
      { emoji: '🐯', name: 'tiger face', keywords: ['tiger'] },
      { emoji: '🦁', name: 'lion face', keywords: ['lion'] },
      { emoji: '🐮', name: 'cow face', keywords: ['cow'] },
      { emoji: '🐷', name: 'pig face', keywords: ['pig'] },
      { emoji: '🐸', name: 'frog face', keywords: ['frog'] },
      { emoji: '🐵', name: 'monkey face', keywords: ['monkey'] },
      { emoji: '🙈', name: 'see-no-evil monkey', keywords: ['monkey', 'evil'] },
      { emoji: '🙉', name: 'hear-no-evil monkey', keywords: ['monkey', 'evil'] },
      { emoji: '🙊', name: 'speak-no-evil monkey', keywords: ['monkey', 'evil'] },
      { emoji: '🐔', name: 'chicken', keywords: ['chicken', 'bird'] },
      { emoji: '🐧', name: 'penguin', keywords: ['penguin', 'bird'] },
      { emoji: '🐦', name: 'bird', keywords: ['bird'] },
      { emoji: '🐤', name: 'baby chick', keywords: ['chick', 'baby'] },
      { emoji: '🦆', name: 'duck', keywords: ['duck', 'bird'] },
      { emoji: '🦅', name: 'eagle', keywords: ['eagle', 'bird'] },
      { emoji: '🦉', name: 'owl', keywords: ['owl', 'bird'] },
      { emoji: '🦇', name: 'bat', keywords: ['bat'] },
      { emoji: '🐺', name: 'wolf face', keywords: ['wolf'] },
      { emoji: '🐗', name: 'boar', keywords: ['boar', 'pig'] },
      { emoji: '🐴', name: 'horse face', keywords: ['horse'] },
      { emoji: '🦄', name: 'unicorn face', keywords: ['unicorn', 'magic'] },
      { emoji: '🐝', name: 'honeybee', keywords: ['bee', 'honey'] },
      { emoji: '🐛', name: 'bug', keywords: ['bug', 'caterpillar'] },
      { emoji: '🦋', name: 'butterfly', keywords: ['butterfly'] },
      { emoji: '🐌', name: 'snail', keywords: ['snail', 'slow'] },
      { emoji: '🐞', name: 'lady beetle', keywords: ['ladybug', 'bug'] },
      { emoji: '🐜', name: 'ant', keywords: ['ant', 'bug'] },
      { emoji: '🦟', name: 'mosquito', keywords: ['mosquito', 'bug'] },
      { emoji: '🦗', name: 'cricket', keywords: ['cricket', 'bug'] },
      { emoji: '🕷️', name: 'spider', keywords: ['spider'] },
      { emoji: '🦂', name: 'scorpion', keywords: ['scorpion'] },
      { emoji: '🐢', name: 'turtle', keywords: ['turtle', 'slow'] },
      { emoji: '🐍', name: 'snake', keywords: ['snake'] },
      { emoji: '🦎', name: 'lizard', keywords: ['lizard'] },
      { emoji: '🦖', name: 't-rex', keywords: ['dinosaur', 'trex'] },
      { emoji: '🦕', name: 'sauropod', keywords: ['dinosaur'] },
      { emoji: '🐙', name: 'octopus', keywords: ['octopus'] },
      { emoji: '🦑', name: 'squid', keywords: ['squid'] },
      { emoji: '🦐', name: 'shrimp', keywords: ['shrimp'] },
      { emoji: '🦞', name: 'lobster', keywords: ['lobster'] },
      { emoji: '🦀', name: 'crab', keywords: ['crab'] },
      { emoji: '🐡', name: 'blowfish', keywords: ['fish'] },
      { emoji: '🐠', name: 'tropical fish', keywords: ['fish'] },
      { emoji: '🐟', name: 'fish', keywords: ['fish'] },
      { emoji: '🐬', name: 'dolphin', keywords: ['dolphin'] },
      { emoji: '🐳', name: 'spouting whale', keywords: ['whale'] },
      { emoji: '🐋', name: 'whale', keywords: ['whale'] },
      { emoji: '🦈', name: 'shark', keywords: ['shark'] },
      { emoji: '🐊', name: 'crocodile', keywords: ['crocodile', 'alligator'] },
      { emoji: '🐆', name: 'leopard', keywords: ['leopard'] },
      { emoji: '🐅', name: 'tiger', keywords: ['tiger'] },
      { emoji: '🐃', name: 'water buffalo', keywords: ['buffalo'] },
      { emoji: '🐂', name: 'ox', keywords: ['ox', 'bull'] },
      { emoji: '🐄', name: 'cow', keywords: ['cow'] },
      { emoji: '🦌', name: 'deer', keywords: ['deer'] },
      { emoji: '🐎', name: 'horse', keywords: ['horse'] },
      { emoji: '🐖', name: 'pig', keywords: ['pig'] },
      { emoji: '🐏', name: 'ram', keywords: ['ram', 'sheep'] },
      { emoji: '🐑', name: 'ewe', keywords: ['sheep'] },
      { emoji: '🦙', name: 'llama', keywords: ['llama'] },
      { emoji: '🐐', name: 'goat', keywords: ['goat'] },
      { emoji: '🦘', name: 'kangaroo', keywords: ['kangaroo'] },
      { emoji: '🦛', name: 'hippopotamus', keywords: ['hippo'] },
      { emoji: '🐘', name: 'elephant', keywords: ['elephant'] },
      { emoji: '🦏', name: 'rhinoceros', keywords: ['rhino'] },
      { emoji: '🦍', name: 'gorilla', keywords: ['gorilla', 'ape'] },
      { emoji: '🦧', name: 'orangutan', keywords: ['orangutan', 'ape'] },
      { emoji: '🐓', name: 'rooster', keywords: ['rooster', 'chicken'] },
      { emoji: '🦃', name: 'turkey', keywords: ['turkey'] },
      { emoji: '🦚', name: 'peacock', keywords: ['peacock'] },
      { emoji: '🦜', name: 'parrot', keywords: ['parrot'] },
      { emoji: '🦢', name: 'swan', keywords: ['swan'] },
      { emoji: '🦩', name: 'flamingo', keywords: ['flamingo'] },
      { emoji: '🕊️', name: 'dove', keywords: ['dove', 'peace'] },
      { emoji: '🐇', name: 'rabbit', keywords: ['rabbit', 'bunny'] },
      { emoji: '🦝', name: 'raccoon', keywords: ['raccoon'] },
      { emoji: '🦨', name: 'skunk', keywords: ['skunk'] },
      { emoji: '🦡', name: 'badger', keywords: ['badger'] },
      { emoji: '🦦', name: 'otter', keywords: ['otter'] },
      { emoji: '🦥', name: 'sloth', keywords: ['sloth'] },
      { emoji: '🐁', name: 'mouse', keywords: ['mouse'] },
      { emoji: '🐀', name: 'rat', keywords: ['rat'] },
      { emoji: '🐿️', name: 'chipmunk', keywords: ['chipmunk', 'squirrel'] },
      { emoji: '🦔', name: 'hedgehog', keywords: ['hedgehog'] },
      { emoji: '🌵', name: 'cactus', keywords: ['cactus', 'plant'] },
      { emoji: '🎄', name: 'christmas tree', keywords: ['christmas', 'tree'] },
      { emoji: '🌲', name: 'evergreen tree', keywords: ['tree', 'forest'] },
      { emoji: '🌳', name: 'deciduous tree', keywords: ['tree'] },
      { emoji: '🌴', name: 'palm tree', keywords: ['palm', 'beach'] },
      { emoji: '🌱', name: 'seedling', keywords: ['plant', 'grow'] },
      { emoji: '🌿', name: 'herb', keywords: ['plant', 'nature'] },
      { emoji: '☘️', name: 'shamrock', keywords: ['clover', 'luck'] },
      { emoji: '🍀', name: 'four leaf clover', keywords: ['luck', 'clover'] },
      { emoji: '🎋', name: 'tanabata tree', keywords: ['bamboo'] },
      { emoji: '🎍', name: 'pine decoration', keywords: ['pine', 'bamboo'] },
      { emoji: '🍃', name: 'leaf fluttering in wind', keywords: ['leaf', 'wind'] },
      { emoji: '🍂', name: 'fallen leaf', keywords: ['autumn', 'fall'] },
      { emoji: '🍁', name: 'maple leaf', keywords: ['maple', 'autumn', 'canada'] },
      { emoji: '🌾', name: 'sheaf of rice', keywords: ['rice', 'grain'] },
      { emoji: '🌺', name: 'hibiscus', keywords: ['flower', 'hibiscus'] },
      { emoji: '🌸', name: 'cherry blossom', keywords: ['flower', 'sakura'] },
      { emoji: '🌼', name: 'blossom', keywords: ['flower'] },
      { emoji: '🌻', name: 'sunflower', keywords: ['sunflower', 'flower'] },
      { emoji: '🌞', name: 'sun with face', keywords: ['sun', 'happy'] },
      { emoji: '🌝', name: 'full moon face', keywords: ['moon', 'face'] },
      { emoji: '🌛', name: 'first quarter moon face', keywords: ['moon'] },
      { emoji: '🌜', name: 'last quarter moon face', keywords: ['moon'] },
      { emoji: '🌚', name: 'new moon face', keywords: ['moon', 'dark'] },
      { emoji: '🌕', name: 'full moon', keywords: ['moon'] },
      { emoji: '🌍', name: 'globe showing europe-africa', keywords: ['earth', 'world'] },
      { emoji: '🌎', name: 'globe showing americas', keywords: ['earth', 'world'] },
      { emoji: '🌏', name: 'globe showing asia-australia', keywords: ['earth', 'world'] },
      { emoji: '🌈', name: 'rainbow', keywords: ['rainbow', 'colorful'] },
      { emoji: '⛅', name: 'sun behind cloud', keywords: ['cloud', 'sunny'] },
      { emoji: '🌤️', name: 'sun behind small cloud', keywords: ['partly cloudy'] },
      { emoji: '⛈️', name: 'cloud with lightning and rain', keywords: ['storm', 'thunder'] },
      { emoji: '🌩️', name: 'cloud with lightning', keywords: ['lightning', 'storm'] },
      { emoji: '🌨️', name: 'cloud with snow', keywords: ['snow', 'cold'] },
      { emoji: '🌧️', name: 'cloud with rain', keywords: ['rain', 'weather'] },
      { emoji: '⛄', name: 'snowman without snow', keywords: ['snowman', 'winter'] },
      { emoji: '❄️', name: 'snowflake', keywords: ['snow', 'cold'] },
      { emoji: '🌬️', name: 'wind face', keywords: ['wind', 'blow'] },
      { emoji: '💨', name: 'dashing away', keywords: ['fast', 'wind'] },
      { emoji: '🌊', name: 'water wave', keywords: ['wave', 'ocean'] },
      { emoji: '🌀', name: 'cyclone', keywords: ['cyclone', 'hurricane'] },
      { emoji: '🌁', name: 'foggy', keywords: ['fog', 'mist'] },
      { emoji: '🌫️', name: 'fog', keywords: ['fog'] },
      { emoji: '🌋', name: 'volcano', keywords: ['volcano', 'lava'] },
      { emoji: '⭐', name: 'star', keywords: ['star'] },
      { emoji: '🌟', name: 'glowing star', keywords: ['star', 'sparkle'] },
      { emoji: '✨', name: 'sparkles', keywords: ['sparkle', 'magic'] },
      { emoji: '⚡', name: 'high voltage', keywords: ['lightning', 'electric'] },
      { emoji: '🔥', name: 'fire', keywords: ['fire', 'hot'] },
      { emoji: '💧', name: 'droplet', keywords: ['water', 'drop'] },
      { emoji: '🌙', name: 'crescent moon', keywords: ['moon', 'night'] },
      { emoji: '☀️', name: 'sun', keywords: ['sun', 'sunny'] },
    ],
  },
  {
    id: 'food',
    label: 'Food & Drink',
    icon: '🍔',
    emojis: [
      { emoji: '🍏', name: 'green apple', keywords: ['apple', 'fruit'] },
      { emoji: '🍎', name: 'red apple', keywords: ['apple', 'fruit'] },
      { emoji: '🍐', name: 'pear', keywords: ['pear', 'fruit'] },
      { emoji: '🍊', name: 'tangerine', keywords: ['orange', 'fruit'] },
      { emoji: '🍋', name: 'lemon', keywords: ['lemon', 'fruit'] },
      { emoji: '🍌', name: 'banana', keywords: ['banana', 'fruit'] },
      { emoji: '🍉', name: 'watermelon', keywords: ['watermelon', 'fruit'] },
      { emoji: '🍇', name: 'grapes', keywords: ['grapes', 'fruit'] },
      { emoji: '🍓', name: 'strawberry', keywords: ['strawberry', 'fruit'] },
      { emoji: '🫐', name: 'blueberries', keywords: ['blueberry', 'fruit'] },
      { emoji: '🍈', name: 'melon', keywords: ['melon', 'fruit'] },
      { emoji: '🍒', name: 'cherries', keywords: ['cherry', 'fruit'] },
      { emoji: '🍑', name: 'peach', keywords: ['peach', 'fruit'] },
      { emoji: '🥭', name: 'mango', keywords: ['mango', 'fruit'] },
      { emoji: '🍍', name: 'pineapple', keywords: ['pineapple', 'fruit'] },
      { emoji: '🥥', name: 'coconut', keywords: ['coconut', 'fruit'] },
      { emoji: '🥝', name: 'kiwi fruit', keywords: ['kiwi', 'fruit'] },
      { emoji: '🍅', name: 'tomato', keywords: ['tomato', 'vegetable'] },
      { emoji: '🫒', name: 'olive', keywords: ['olive'] },
      { emoji: '🥑', name: 'avocado', keywords: ['avocado'] },
      { emoji: '🍆', name: 'eggplant', keywords: ['eggplant', 'aubergine'] },
      { emoji: '🥔', name: 'potato', keywords: ['potato', 'vegetable'] },
      { emoji: '🥕', name: 'carrot', keywords: ['carrot', 'vegetable'] },
      { emoji: '🌽', name: 'ear of corn', keywords: ['corn', 'maize'] },
      { emoji: '🌶️', name: 'hot pepper', keywords: ['pepper', 'spicy'] },
      { emoji: '🫑', name: 'bell pepper', keywords: ['pepper', 'vegetable'] },
      { emoji: '🥒', name: 'cucumber', keywords: ['cucumber', 'vegetable'] },
      { emoji: '🥬', name: 'leafy green', keywords: ['salad', 'vegetable'] },
      { emoji: '🥦', name: 'broccoli', keywords: ['broccoli', 'vegetable'] },
      { emoji: '🧄', name: 'garlic', keywords: ['garlic'] },
      { emoji: '🧅', name: 'onion', keywords: ['onion'] },
      { emoji: '🍄', name: 'mushroom', keywords: ['mushroom'] },
      { emoji: '🥜', name: 'peanuts', keywords: ['peanut', 'nuts'] },
      { emoji: '🌰', name: 'chestnut', keywords: ['chestnut', 'nut'] },
      { emoji: '🍞', name: 'bread', keywords: ['bread'] },
      { emoji: '🥐', name: 'croissant', keywords: ['croissant', 'bread'] },
      { emoji: '🥖', name: 'baguette bread', keywords: ['baguette', 'bread'] },
      { emoji: '🫓', name: 'flatbread', keywords: ['flatbread', 'bread'] },
      { emoji: '🥨', name: 'pretzel', keywords: ['pretzel'] },
      { emoji: '🥯', name: 'bagel', keywords: ['bagel'] },
      { emoji: '🧀', name: 'cheese wedge', keywords: ['cheese'] },
      { emoji: '🥚', name: 'egg', keywords: ['egg'] },
      { emoji: '🍳', name: 'cooking', keywords: ['frying', 'egg', 'breakfast'] },
      { emoji: '🧈', name: 'butter', keywords: ['butter'] },
      { emoji: '🥞', name: 'pancakes', keywords: ['pancakes', 'breakfast'] },
      { emoji: '🧇', name: 'waffle', keywords: ['waffle', 'breakfast'] },
      { emoji: '🥓', name: 'bacon', keywords: ['bacon', 'breakfast'] },
      { emoji: '🥩', name: 'cut of meat', keywords: ['steak', 'meat'] },
      { emoji: '🍗', name: 'poultry leg', keywords: ['chicken', 'turkey'] },
      { emoji: '🍖', name: 'meat on bone', keywords: ['meat', 'bone'] },
      { emoji: '🦴', name: 'bone', keywords: ['bone'] },
      { emoji: '🌭', name: 'hot dog', keywords: ['hotdog', 'sausage'] },
      { emoji: '🍔', name: 'hamburger', keywords: ['burger', 'hamburger'] },
      { emoji: '🍟', name: 'french fries', keywords: ['fries', 'chips'] },
      { emoji: '🍕', name: 'pizza', keywords: ['pizza'] },
      { emoji: '🫔', name: 'tamale', keywords: ['tamale'] },
      { emoji: '🌮', name: 'taco', keywords: ['taco'] },
      { emoji: '🌯', name: 'burrito', keywords: ['burrito', 'wrap'] },
      { emoji: '🥙', name: 'stuffed flatbread', keywords: ['wrap', 'falafel'] },
      { emoji: '🧆', name: 'falafel', keywords: ['falafel'] },
      { emoji: '🥚', name: 'egg', keywords: ['egg'] },
      { emoji: '🍜', name: 'steaming bowl', keywords: ['noodles', 'ramen'] },
      { emoji: '🍝', name: 'spaghetti', keywords: ['pasta', 'spaghetti'] },
      { emoji: '🍛', name: 'curry rice', keywords: ['curry', 'rice'] },
      { emoji: '🍣', name: 'sushi', keywords: ['sushi', 'japanese'] },
      { emoji: '🍱', name: 'bento box', keywords: ['bento', 'japanese'] },
      { emoji: '🥟', name: 'dumpling', keywords: ['dumpling', 'potsticker'] },
      { emoji: '🍤', name: 'fried shrimp', keywords: ['shrimp', 'fried'] },
      { emoji: '🍙', name: 'rice ball', keywords: ['rice', 'onigiri'] },
      { emoji: '🍚', name: 'cooked rice', keywords: ['rice'] },
      { emoji: '🍘', name: 'rice cracker', keywords: ['rice', 'cracker'] },
      { emoji: '🥮', name: 'moon cake', keywords: ['mooncake', 'chinese'] },
      { emoji: '🍢', name: 'oden', keywords: ['oden', 'japanese'] },
      { emoji: '🍡', name: 'dango', keywords: ['dango', 'japanese'] },
      { emoji: '🍧', name: 'shaved ice', keywords: ['shaved ice', 'dessert'] },
      { emoji: '🍨', name: 'ice cream', keywords: ['ice cream', 'dessert'] },
      { emoji: '🍦', name: 'soft ice cream', keywords: ['ice cream', 'dessert'] },
      { emoji: '🥧', name: 'pie', keywords: ['pie', 'dessert'] },
      { emoji: '🧁', name: 'cupcake', keywords: ['cupcake', 'cake'] },
      { emoji: '🍰', name: 'shortcake', keywords: ['cake', 'dessert'] },
      { emoji: '🎂', name: 'birthday cake', keywords: ['birthday', 'cake'] },
      { emoji: '🍮', name: 'custard', keywords: ['pudding', 'flan'] },
      { emoji: '🍭', name: 'lollipop', keywords: ['lollipop', 'candy'] },
      { emoji: '🍬', name: 'candy', keywords: ['candy', 'sweet'] },
      { emoji: '🍫', name: 'chocolate bar', keywords: ['chocolate'] },
      { emoji: '🍿', name: 'popcorn', keywords: ['popcorn', 'movie'] },
      { emoji: '🍩', name: 'doughnut', keywords: ['donut', 'doughnut'] },
      { emoji: '🍪', name: 'cookie', keywords: ['cookie', 'biscuit'] },
      { emoji: '🌰', name: 'chestnut', keywords: ['chestnut'] },
      { emoji: '🥜', name: 'peanuts', keywords: ['peanuts', 'nuts'] },
      { emoji: '🍯', name: 'honey pot', keywords: ['honey'] },
      { emoji: '🧃', name: 'beverage box', keywords: ['juice', 'drink'] },
      { emoji: '🥤', name: 'cup with straw', keywords: ['drink', 'soda'] },
      { emoji: '🧋', name: 'bubble tea', keywords: ['boba', 'tea'] },
      { emoji: '☕', name: 'hot beverage', keywords: ['coffee', 'tea'] },
      { emoji: '🍵', name: 'teacup without handle', keywords: ['tea', 'green tea'] },
      { emoji: '🫖', name: 'teapot', keywords: ['teapot', 'tea'] },
      { emoji: '🍺', name: 'beer mug', keywords: ['beer', 'drink'] },
      { emoji: '🍻', name: 'clinking beer mugs', keywords: ['beer', 'cheers'] },
      { emoji: '🥂', name: 'clinking glasses', keywords: ['champagne', 'cheers'] },
      { emoji: '🍷', name: 'wine glass', keywords: ['wine', 'drink'] },
      { emoji: '🥃', name: 'tumbler glass', keywords: ['whiskey', 'drink'] },
      { emoji: '🍸', name: 'cocktail glass', keywords: ['cocktail', 'drink'] },
      { emoji: '🍹', name: 'tropical drink', keywords: ['tropical', 'drink'] },
      { emoji: '🧉', name: 'mate', keywords: ['mate', 'drink'] },
      { emoji: '🍾', name: 'bottle with popping cork', keywords: ['champagne', 'celebrate'] },
      { emoji: '🧊', name: 'ice', keywords: ['ice', 'cold'] },
      { emoji: '🍶', name: 'sake', keywords: ['sake', 'japanese'] },
      { emoji: '🧃', name: 'beverage box', keywords: ['juice'] },
      { emoji: '🥛', name: 'glass of milk', keywords: ['milk', 'drink'] },
      { emoji: '🫗', name: 'pouring liquid', keywords: ['pour', 'liquid'] },
    ],
  },
  {
    id: 'activities',
    label: 'Activities',
    icon: '⚽',
    emojis: [
      { emoji: '⚽', name: 'soccer ball', keywords: ['soccer', 'football'] },
      { emoji: '🏀', name: 'basketball', keywords: ['basketball', 'sport'] },
      { emoji: '🏈', name: 'american football', keywords: ['football', 'sport'] },
      { emoji: '⚾', name: 'baseball', keywords: ['baseball', 'sport'] },
      { emoji: '🥎', name: 'softball', keywords: ['softball', 'sport'] },
      { emoji: '🎾', name: 'tennis', keywords: ['tennis', 'sport'] },
      { emoji: '🏐', name: 'volleyball', keywords: ['volleyball', 'sport'] },
      { emoji: '🏉', name: 'rugby football', keywords: ['rugby', 'sport'] },
      { emoji: '🥏', name: 'flying disc', keywords: ['frisbee', 'disc'] },
      { emoji: '🎱', name: 'pool 8 ball', keywords: ['pool', 'billiards'] },
      { emoji: '🏓', name: 'ping pong', keywords: ['pingpong', 'tabletennis'] },
      { emoji: '🏸', name: 'badminton', keywords: ['badminton'] },
      { emoji: '🏒', name: 'ice hockey', keywords: ['hockey', 'ice'] },
      { emoji: '🏑', name: 'field hockey', keywords: ['hockey', 'field'] },
      { emoji: '🥍', name: 'lacrosse', keywords: ['lacrosse'] },
      { emoji: '🏏', name: 'cricket game', keywords: ['cricket', 'sport'] },
      { emoji: '🪃', name: 'boomerang', keywords: ['boomerang'] },
      { emoji: '🥅', name: 'goal net', keywords: ['goal', 'net'] },
      { emoji: '⛳', name: 'flag in hole', keywords: ['golf'] },
      { emoji: '🪁', name: 'bow and arrow', keywords: ['archery', 'bow'] },
      { emoji: '🎣', name: 'fishing pole', keywords: ['fishing'] },
      { emoji: '🤿', name: 'diving mask', keywords: ['diving', 'snorkel'] },
      { emoji: '🎽', name: 'running shirt', keywords: ['running', 'sport'] },
      { emoji: '🎿', name: 'skis', keywords: ['skiing', 'ski'] },
      { emoji: '🛷', name: 'sled', keywords: ['sled', 'sledding'] },
      { emoji: '🥌', name: 'curling stone', keywords: ['curling'] },
      { emoji: '🎯', name: 'bullseye', keywords: ['target', 'dart'] },
      { emoji: '🪀', name: 'yo-yo', keywords: ['yoyo'] },
      { emoji: '🪆', name: 'nesting dolls', keywords: ['matryoshka', 'dolls'] },
      { emoji: '🎮', name: 'video game', keywords: ['gaming', 'controller'] },
      { emoji: '🕹️', name: 'joystick', keywords: ['joystick', 'game'] },
      { emoji: '🎲', name: 'game die', keywords: ['dice', 'game'] },
      { emoji: '🧩', name: 'puzzle piece', keywords: ['puzzle'] },
      { emoji: '🎭', name: 'performing arts', keywords: ['theater', 'arts'] },
      { emoji: '🎨', name: 'artist palette', keywords: ['art', 'paint'] },
      { emoji: '🧵', name: 'thread', keywords: ['sewing', 'thread'] },
      { emoji: '🧶', name: 'yarn', keywords: ['knitting', 'yarn'] },
      { emoji: '🎪', name: 'circus tent', keywords: ['circus'] },
      { emoji: '🎤', name: 'microphone', keywords: ['mic', 'sing'] },
      { emoji: '🎧', name: 'headphone', keywords: ['headphones', 'music'] },
      { emoji: '🎼', name: 'musical score', keywords: ['music', 'notes'] },
      { emoji: '🎹', name: 'musical keyboard', keywords: ['piano', 'keyboard'] },
      { emoji: '🥁', name: 'drum', keywords: ['drum', 'music'] },
      { emoji: '🪘', name: 'long drum', keywords: ['drum', 'music'] },
      { emoji: '🎷', name: 'saxophone', keywords: ['saxophone', 'music'] },
      { emoji: '🎺', name: 'trumpet', keywords: ['trumpet', 'music'] },
      { emoji: '🎸', name: 'guitar', keywords: ['guitar', 'music'] },
      { emoji: '🪕', name: 'banjo', keywords: ['banjo', 'music'] },
      { emoji: '🎻', name: 'violin', keywords: ['violin', 'music'] },
      { emoji: '🎬', name: 'clapper board', keywords: ['movie', 'film'] },
      { emoji: '🎥', name: 'movie camera', keywords: ['camera', 'film'] },
      { emoji: '📽️', name: 'film projector', keywords: ['film', 'projector'] },
      { emoji: '🎞️', name: 'film frames', keywords: ['film'] },
      { emoji: '📺', name: 'television', keywords: ['tv', 'television'] },
      { emoji: '🎙️', name: 'studio microphone', keywords: ['podcast', 'mic'] },
      { emoji: '🎚️', name: 'level slider', keywords: ['audio', 'level'] },
      { emoji: '🎛️', name: 'control knobs', keywords: ['audio', 'controls'] },
      { emoji: '🧸', name: 'teddy bear', keywords: ['bear', 'toy'] },
      { emoji: '🪅', name: 'piñata', keywords: ['pinata', 'party'] },
      { emoji: '🎊', name: 'confetti ball', keywords: ['confetti', 'party'] },
      { emoji: '🎉', name: 'party popper', keywords: ['party', 'celebrate'] },
      { emoji: '🎀', name: 'ribbon', keywords: ['ribbon', 'bow'] },
      { emoji: '🎁', name: 'wrapped gift', keywords: ['gift', 'present'] },
      { emoji: '🎗️', name: 'reminder ribbon', keywords: ['ribbon'] },
      { emoji: '🎟️', name: 'admission tickets', keywords: ['ticket', 'event'] },
      { emoji: '🎫', name: 'ticket', keywords: ['ticket'] },
      { emoji: '🏆', name: 'trophy', keywords: ['trophy', 'win'] },
      { emoji: '🥇', name: 'gold medal', keywords: ['gold', 'medal', 'first'] },
      { emoji: '🥈', name: 'silver medal', keywords: ['silver', 'medal', 'second'] },
      { emoji: '🥉', name: 'bronze medal', keywords: ['bronze', 'medal', 'third'] },
      { emoji: '🏅', name: 'sports medal', keywords: ['medal', 'sport'] },
      { emoji: '🎖️', name: 'military medal', keywords: ['medal', 'military'] },
    ],
  },
  {
    id: 'travel',
    label: 'Travel & Places',
    icon: '✈️',
    emojis: [
      { emoji: '🚗', name: 'automobile', keywords: ['car', 'drive'] },
      { emoji: '🚕', name: 'taxi', keywords: ['taxi', 'cab'] },
      { emoji: '🚙', name: 'sport utility vehicle', keywords: ['suv', 'car'] },
      { emoji: '🚌', name: 'bus', keywords: ['bus', 'public transport'] },
      { emoji: '🚎', name: 'trolleybus', keywords: ['trolley', 'bus'] },
      { emoji: '🏎️', name: 'racing car', keywords: ['race', 'car', 'fast'] },
      { emoji: '🚓', name: 'police car', keywords: ['police', 'cop'] },
      { emoji: '🚑', name: 'ambulance', keywords: ['ambulance', 'emergency'] },
      { emoji: '🚒', name: 'fire engine', keywords: ['fire', 'truck'] },
      { emoji: '🚐', name: 'minibus', keywords: ['minibus', 'van'] },
      { emoji: '🛻', name: 'pickup truck', keywords: ['truck', 'pickup'] },
      { emoji: '🚚', name: 'delivery truck', keywords: ['truck', 'delivery'] },
      { emoji: '🚛', name: 'articulated lorry', keywords: ['truck', 'semi'] },
      { emoji: '🚜', name: 'tractor', keywords: ['tractor', 'farm'] },
      { emoji: '🏍️', name: 'motorcycle', keywords: ['motorcycle', 'bike'] },
      { emoji: '🛵', name: 'motor scooter', keywords: ['scooter', 'moped'] },
      { emoji: '🚲', name: 'bicycle', keywords: ['bike', 'bicycle'] },
      { emoji: '🛴', name: 'kick scooter', keywords: ['scooter'] },
      { emoji: '🛹', name: 'skateboard', keywords: ['skateboard', 'skate'] },
      { emoji: '🛼', name: 'roller skate', keywords: ['rollerskate'] },
      { emoji: '🚏', name: 'bus stop', keywords: ['bus', 'stop'] },
      { emoji: '🛣️', name: 'motorway', keywords: ['highway', 'road'] },
      { emoji: '🛤️', name: 'railway track', keywords: ['train', 'railway'] },
      { emoji: '⛽', name: 'fuel pump', keywords: ['gas', 'fuel'] },
      { emoji: '🚨', name: 'police car light', keywords: ['siren', 'police'] },
      { emoji: '🚥', name: 'horizontal traffic light', keywords: ['traffic', 'light'] },
      { emoji: '🚦', name: 'vertical traffic light', keywords: ['traffic', 'light'] },
      { emoji: '🛑', name: 'stop sign', keywords: ['stop'] },
      { emoji: '🚧', name: 'construction', keywords: ['construction', 'barrier'] },
      { emoji: '⚓', name: 'anchor', keywords: ['anchor', 'ship'] },
      { emoji: '🛟', name: 'ring buoy', keywords: ['lifebuoy', 'safety'] },
      { emoji: '⛵', name: 'sailboat', keywords: ['sailing', 'boat'] },
      { emoji: '🛶', name: 'canoe', keywords: ['canoe', 'kayak'] },
      { emoji: '🚤', name: 'speedboat', keywords: ['boat', 'speed'] },
      { emoji: '🛥️', name: 'motor boat', keywords: ['boat', 'motor'] },
      { emoji: '🛳️', name: 'passenger ship', keywords: ['ship', 'cruise'] },
      { emoji: '⛴️', name: 'ferry', keywords: ['ferry', 'boat'] },
      { emoji: '🚢', name: 'ship', keywords: ['ship', 'cruise'] },
      { emoji: '✈️', name: 'airplane', keywords: ['plane', 'fly', 'travel'] },
      { emoji: '🛩️', name: 'small airplane', keywords: ['plane', 'fly'] },
      { emoji: '🛫', name: 'airplane departure', keywords: ['flight', 'departure'] },
      { emoji: '🛬', name: 'airplane arrival', keywords: ['flight', 'arrival'] },
      { emoji: '🪂', name: 'parachute', keywords: ['parachute', 'skydive'] },
      { emoji: '💺', name: 'seat', keywords: ['seat', 'airplane'] },
      { emoji: '🚁', name: 'helicopter', keywords: ['helicopter'] },
      { emoji: '🚟', name: 'suspension railway', keywords: ['railway', 'mono'] },
      { emoji: '🚠', name: 'mountain cableway', keywords: ['cable car', 'mountain'] },
      { emoji: '🚡', name: 'aerial tramway', keywords: ['tramway', 'aerial'] },
      { emoji: '🛰️', name: 'satellite', keywords: ['satellite', 'space'] },
      { emoji: '🚀', name: 'rocket', keywords: ['rocket', 'space'] },
      { emoji: '🛸', name: 'flying saucer', keywords: ['ufo', 'alien'] },
      { emoji: '🏠', name: 'house', keywords: ['house', 'home'] },
      { emoji: '🏡', name: 'house with garden', keywords: ['house', 'home'] },
      { emoji: '🏢', name: 'office building', keywords: ['office', 'building'] },
      { emoji: '🏣', name: 'japanese post office', keywords: ['post office'] },
      { emoji: '🏤', name: 'post office', keywords: ['post office'] },
      { emoji: '🏥', name: 'hospital', keywords: ['hospital'] },
      { emoji: '🏦', name: 'bank', keywords: ['bank', 'money'] },
      { emoji: '🏨', name: 'hotel', keywords: ['hotel'] },
      { emoji: '🏩', name: 'love hotel', keywords: ['hotel', 'love'] },
      { emoji: '🏪', name: 'convenience store', keywords: ['store', 'shop'] },
      { emoji: '🏫', name: 'school', keywords: ['school', 'education'] },
      { emoji: '🏬', name: 'department store', keywords: ['store', 'mall'] },
      { emoji: '🏭', name: 'factory', keywords: ['factory', 'industrial'] },
      { emoji: '🏯', name: 'japanese castle', keywords: ['castle', 'japanese'] },
      { emoji: '🏰', name: 'european castle', keywords: ['castle'] },
      { emoji: '💒', name: 'wedding', keywords: ['wedding', 'church'] },
      { emoji: '🗼', name: 'tokyo tower', keywords: ['tokyo', 'tower'] },
      { emoji: '🗽', name: 'statue of liberty', keywords: ['liberty', 'usa'] },
      { emoji: '⛪', name: 'church', keywords: ['church', 'religion'] },
      { emoji: '🕌', name: 'mosque', keywords: ['mosque', 'islam'] },
      { emoji: '🛕', name: 'hindu temple', keywords: ['temple', 'hindu'] },
      { emoji: '⛩️', name: 'shinto shrine', keywords: ['shrine', 'japanese'] },
      { emoji: '🕍', name: 'synagogue', keywords: ['synagogue', 'jewish'] },
      { emoji: '⛲', name: 'fountain', keywords: ['fountain', 'water'] },
      { emoji: '🌁', name: 'foggy', keywords: ['fog', 'city'] },
      { emoji: '🌃', name: 'night with stars', keywords: ['night', 'city'] },
      { emoji: '🌄', name: 'sunrise over mountains', keywords: ['sunrise', 'morning'] },
      { emoji: '🌅', name: 'sunrise', keywords: ['sunrise', 'morning'] },
      { emoji: '🌆', name: 'cityscape at dusk', keywords: ['city', 'dusk'] },
      { emoji: '🌇', name: 'sunset', keywords: ['sunset', 'city'] },
      { emoji: '🌉', name: 'bridge at night', keywords: ['bridge', 'night'] },
      { emoji: '🗺️', name: 'world map', keywords: ['map', 'world'] },
      { emoji: '🧭', name: 'compass', keywords: ['compass', 'navigate'] },
      { emoji: '⛰️', name: 'mountain', keywords: ['mountain'] },
      { emoji: '🏔️', name: 'snow-capped mountain', keywords: ['mountain', 'snow'] },
      { emoji: '🗻', name: 'mount fuji', keywords: ['fuji', 'mountain'] },
      { emoji: '🏕️', name: 'camping', keywords: ['camping', 'tent'] },
      { emoji: '🏖️', name: 'beach with umbrella', keywords: ['beach', 'vacation'] },
      { emoji: '🏜️', name: 'desert', keywords: ['desert'] },
      { emoji: '🏝️', name: 'desert island', keywords: ['island', 'tropical'] },
      { emoji: '🏟️', name: 'stadium', keywords: ['stadium', 'sport'] },
    ],
  },
  {
    id: 'objects',
    label: 'Objects',
    icon: '💡',
    emojis: [
      { emoji: '⌚', name: 'watch', keywords: ['watch', 'time'] },
      { emoji: '📱', name: 'mobile phone', keywords: ['phone', 'mobile'] },
      { emoji: '💻', name: 'laptop', keywords: ['laptop', 'computer'] },
      { emoji: '⌨️', name: 'keyboard', keywords: ['keyboard', 'computer'] },
      { emoji: '🖥️', name: 'desktop computer', keywords: ['computer', 'desktop'] },
      { emoji: '🖨️', name: 'printer', keywords: ['printer'] },
      { emoji: '🖱️', name: 'computer mouse', keywords: ['mouse', 'computer'] },
      { emoji: '💾', name: 'floppy disk', keywords: ['floppy', 'save'] },
      { emoji: '💿', name: 'optical disk', keywords: ['cd', 'disk'] },
      { emoji: '📀', name: 'dvd', keywords: ['dvd', 'disk'] },
      { emoji: '📷', name: 'camera', keywords: ['camera', 'photo'] },
      { emoji: '📸', name: 'camera with flash', keywords: ['camera', 'flash'] },
      { emoji: '📹', name: 'video camera', keywords: ['video', 'camera'] },
      { emoji: '📡', name: 'satellite antenna', keywords: ['satellite', 'antenna'] },
      { emoji: '☎️', name: 'telephone', keywords: ['phone', 'telephone'] },
      { emoji: '📞', name: 'telephone receiver', keywords: ['phone', 'call'] },
      { emoji: '📟', name: 'pager', keywords: ['pager', 'beeper'] },
      { emoji: '📠', name: 'fax machine', keywords: ['fax'] },
      { emoji: '📺', name: 'television', keywords: ['tv', 'television'] },
      { emoji: '📻', name: 'radio', keywords: ['radio'] },
      { emoji: '🧭', name: 'compass', keywords: ['compass', 'navigate'] },
      { emoji: '⏰', name: 'alarm clock', keywords: ['alarm', 'clock'] },
      { emoji: '⌛', name: 'hourglass done', keywords: ['hourglass', 'time'] },
      { emoji: '⏳', name: 'hourglass not done', keywords: ['hourglass', 'time'] },
      { emoji: '💡', name: 'light bulb', keywords: ['idea', 'light'] },
      { emoji: '🔦', name: 'flashlight', keywords: ['flashlight', 'torch'] },
      { emoji: '🕯️', name: 'candle', keywords: ['candle', 'light'] },
      { emoji: '🪔', name: 'diya lamp', keywords: ['lamp', 'diya'] },
      { emoji: '🧯', name: 'fire extinguisher', keywords: ['fire', 'extinguisher'] },
      { emoji: '🛢️', name: 'oil drum', keywords: ['oil', 'barrel'] },
      { emoji: '💰', name: 'money bag', keywords: ['money', 'bag'] },
      { emoji: '💳', name: 'credit card', keywords: ['credit card', 'payment'] },
      { emoji: '💎', name: 'gem stone', keywords: ['diamond', 'gem'] },
      { emoji: '⚖️', name: 'balance scale', keywords: ['scale', 'justice'] },
      { emoji: '🪤', name: 'mouse trap', keywords: ['trap'] },
      { emoji: '🔧', name: 'wrench', keywords: ['wrench', 'tool'] },
      { emoji: '🔨', name: 'hammer', keywords: ['hammer', 'tool'] },
      { emoji: '⚒️', name: 'hammer and pick', keywords: ['tools', 'mining'] },
      { emoji: '🛠️', name: 'hammer and wrench', keywords: ['tools', 'fix'] },
      { emoji: '⛏️', name: 'pick', keywords: ['pick', 'mining'] },
      { emoji: '🪛', name: 'screwdriver', keywords: ['screwdriver', 'tool'] },
      { emoji: '🔩', name: 'nut and bolt', keywords: ['bolt', 'nut', 'screw'] },
      { emoji: '🪝', name: 'hook', keywords: ['hook'] },
      { emoji: '🧲', name: 'magnet', keywords: ['magnet'] },
      { emoji: '🔫', name: 'pistol', keywords: ['gun', 'pistol'] },
      { emoji: '💣', name: 'bomb', keywords: ['bomb', 'explosion'] },
      { emoji: '🪓', name: 'axe', keywords: ['axe', 'chop'] },
      { emoji: '🔪', name: 'kitchen knife', keywords: ['knife', 'blade'] },
      { emoji: '🗡️', name: 'dagger', keywords: ['dagger', 'sword'] },
      { emoji: '⚔️', name: 'crossed swords', keywords: ['swords', 'battle'] },
      { emoji: '🛡️', name: 'shield', keywords: ['shield', 'protect'] },
      { emoji: '🪚', name: 'carpentry saw', keywords: ['saw', 'tool'] },
      { emoji: '🔑', name: 'key', keywords: ['key', 'lock'] },
      { emoji: '🗝️', name: 'old key', keywords: ['key', 'old'] },
      { emoji: '🔐', name: 'locked with key', keywords: ['locked', 'secure'] },
      { emoji: '🔒', name: 'locked', keywords: ['locked', 'secure'] },
      { emoji: '🔓', name: 'unlocked', keywords: ['unlocked', 'open'] },
      { emoji: '🚪', name: 'door', keywords: ['door'] },
      { emoji: '🪞', name: 'mirror', keywords: ['mirror', 'reflect'] },
      { emoji: '🪟', name: 'window', keywords: ['window'] },
      { emoji: '🛋️', name: 'couch and lamp', keywords: ['sofa', 'couch'] },
      { emoji: '🪑', name: 'chair', keywords: ['chair'] },
      { emoji: '🚽', name: 'toilet', keywords: ['toilet'] },
      { emoji: '🚿', name: 'shower', keywords: ['shower'] },
      { emoji: '🛁', name: 'bathtub', keywords: ['bath', 'tub'] },
      { emoji: '📦', name: 'package', keywords: ['box', 'package'] },
      { emoji: '📫', name: 'closed mailbox with raised flag', keywords: ['mail', 'mailbox'] },
      { emoji: '📬', name: 'open mailbox with raised flag', keywords: ['mail', 'mailbox'] },
      { emoji: '📮', name: 'postbox', keywords: ['mail', 'postbox'] },
      { emoji: '📝', name: 'memo', keywords: ['note', 'write'] },
      { emoji: '📄', name: 'page facing up', keywords: ['document', 'paper'] },
      { emoji: '📃', name: 'page with curl', keywords: ['document', 'paper'] },
      { emoji: '📋', name: 'clipboard', keywords: ['clipboard'] },
      { emoji: '📊', name: 'bar chart', keywords: ['chart', 'graph'] },
      { emoji: '📈', name: 'chart increasing', keywords: ['chart', 'up', 'growth'] },
      { emoji: '📉', name: 'chart decreasing', keywords: ['chart', 'down'] },
      { emoji: '🗒️', name: 'spiral notepad', keywords: ['notepad', 'notes'] },
      { emoji: '📅', name: 'calendar', keywords: ['calendar', 'date'] },
      { emoji: '📌', name: 'pushpin', keywords: ['pin', 'pushpin'] },
      { emoji: '📍', name: 'round pushpin', keywords: ['pin', 'location'] },
      { emoji: '📎', name: 'paperclip', keywords: ['paperclip', 'attach'] },
      { emoji: '✂️', name: 'scissors', keywords: ['scissors', 'cut'] },
      { emoji: '🗃️', name: 'card file box', keywords: ['file', 'box'] },
      { emoji: '🗄️', name: 'file cabinet', keywords: ['file', 'cabinet'] },
      { emoji: '🗑️', name: 'wastebasket', keywords: ['trash', 'delete'] },
    ],
  },
  {
    id: 'symbols',
    label: 'Symbols',
    icon: '❤️',
    emojis: [
      { emoji: '❤️', name: 'red heart', keywords: ['love', 'heart'] },
      { emoji: '🧡', name: 'orange heart', keywords: ['love', 'heart'] },
      { emoji: '💛', name: 'yellow heart', keywords: ['love', 'heart'] },
      { emoji: '💚', name: 'green heart', keywords: ['love', 'heart'] },
      { emoji: '💙', name: 'blue heart', keywords: ['love', 'heart'] },
      { emoji: '💜', name: 'purple heart', keywords: ['love', 'heart'] },
      { emoji: '🖤', name: 'black heart', keywords: ['love', 'heart', 'dark'] },
      { emoji: '🤍', name: 'white heart', keywords: ['love', 'heart'] },
      { emoji: '🤎', name: 'brown heart', keywords: ['love', 'heart'] },
      { emoji: '💔', name: 'broken heart', keywords: ['heartbreak', 'sad'] },
      { emoji: '❣️', name: 'heart exclamation', keywords: ['heart', 'exclamation'] },
      { emoji: '💕', name: 'two hearts', keywords: ['love', 'hearts'] },
      { emoji: '💞', name: 'revolving hearts', keywords: ['love', 'hearts'] },
      { emoji: '💓', name: 'beating heart', keywords: ['love', 'heart'] },
      { emoji: '💗', name: 'growing heart', keywords: ['love', 'heart'] },
      { emoji: '💖', name: 'sparkling heart', keywords: ['love', 'heart'] },
      { emoji: '💘', name: 'heart with arrow', keywords: ['love', 'cupid'] },
      { emoji: '💝', name: 'heart with ribbon', keywords: ['love', 'gift'] },
      { emoji: '💟', name: 'heart decoration', keywords: ['heart'] },
      { emoji: '☮️', name: 'peace symbol', keywords: ['peace'] },
      { emoji: '✝️', name: 'latin cross', keywords: ['cross', 'christian'] },
      { emoji: '☪️', name: 'star and crescent', keywords: ['islam', 'muslim'] },
      { emoji: '🕉️', name: 'om', keywords: ['om', 'hindu'] },
      { emoji: '✡️', name: 'star of david', keywords: ['jewish', 'star'] },
      { emoji: '🔯', name: 'dotted six-pointed star', keywords: ['star', 'jewish'] },
      { emoji: '🕎', name: 'menorah', keywords: ['menorah', 'jewish'] },
      { emoji: '☯️', name: 'yin yang', keywords: ['yin yang', 'balance'] },
      { emoji: '☦️', name: 'orthodox cross', keywords: ['cross', 'christian'] },
      { emoji: '🛐', name: 'place of worship', keywords: ['worship', 'religion'] },
      { emoji: '♈', name: 'aries', keywords: ['aries', 'zodiac'] },
      { emoji: '♉', name: 'taurus', keywords: ['taurus', 'zodiac'] },
      { emoji: '♊', name: 'gemini', keywords: ['gemini', 'zodiac'] },
      { emoji: '♋', name: 'cancer', keywords: ['cancer', 'zodiac'] },
      { emoji: '♌', name: 'leo', keywords: ['leo', 'zodiac'] },
      { emoji: '♍', name: 'virgo', keywords: ['virgo', 'zodiac'] },
      { emoji: '♎', name: 'libra', keywords: ['libra', 'zodiac'] },
      { emoji: '♏', name: 'scorpio', keywords: ['scorpio', 'zodiac'] },
      { emoji: '♐', name: 'sagittarius', keywords: ['sagittarius', 'zodiac'] },
      { emoji: '♑', name: 'capricorn', keywords: ['capricorn', 'zodiac'] },
      { emoji: '♒', name: 'aquarius', keywords: ['aquarius', 'zodiac'] },
      { emoji: '♓', name: 'pisces', keywords: ['pisces', 'zodiac'] },
      { emoji: '⛎', name: 'ophiuchus', keywords: ['ophiuchus', 'zodiac'] },
      { emoji: '🔀', name: 'shuffle tracks button', keywords: ['shuffle', 'random'] },
      { emoji: '🔁', name: 'repeat button', keywords: ['repeat', 'loop'] },
      { emoji: '🔂', name: 'repeat single button', keywords: ['repeat'] },
      { emoji: '▶️', name: 'play button', keywords: ['play'] },
      { emoji: '⏩', name: 'fast-forward button', keywords: ['fast forward'] },
      { emoji: '⏭️', name: 'next track button', keywords: ['next', 'skip'] },
      { emoji: '⏯️', name: 'play or pause button', keywords: ['play', 'pause'] },
      { emoji: '◀️', name: 'reverse button', keywords: ['back', 'rewind'] },
      { emoji: '⏪', name: 'fast reverse button', keywords: ['rewind'] },
      { emoji: '⏮️', name: 'last track button', keywords: ['previous'] },
      { emoji: '🔼', name: 'upwards button', keywords: ['up'] },
      { emoji: '⏫', name: 'fast up button', keywords: ['up', 'fast'] },
      { emoji: '🔽', name: 'downwards button', keywords: ['down'] },
      { emoji: '⏬', name: 'fast down button', keywords: ['down', 'fast'] },
      { emoji: '⏸️', name: 'pause button', keywords: ['pause'] },
      { emoji: '⏹️', name: 'stop button', keywords: ['stop'] },
      { emoji: '⏺️', name: 'record button', keywords: ['record'] },
      { emoji: '🎦', name: 'cinema', keywords: ['cinema', 'movie'] },
      { emoji: '🔅', name: 'dim button', keywords: ['dim', 'brightness'] },
      { emoji: '🔆', name: 'bright button', keywords: ['bright', 'brightness'] },
      { emoji: '📶', name: 'antenna bars', keywords: ['signal', 'wifi'] },
      { emoji: '📳', name: 'vibration mode', keywords: ['vibrate', 'phone'] },
      { emoji: '📴', name: 'mobile phone off', keywords: ['phone', 'off'] },
      { emoji: '♻️', name: 'recycling symbol', keywords: ['recycle', 'green'] },
      { emoji: '🔱', name: 'trident emblem', keywords: ['trident'] },
      { emoji: '📛', name: 'name badge', keywords: ['badge', 'name'] },
      { emoji: '🔰', name: 'japanese symbol for beginner', keywords: ['beginner', 'japanese'] },
      { emoji: '⭕', name: 'hollow red circle', keywords: ['circle', 'correct'] },
      { emoji: '✅', name: 'check mark button', keywords: ['check', 'correct', 'yes'] },
      { emoji: '☑️', name: 'check box with check', keywords: ['check', 'box'] },
      { emoji: '✔️', name: 'check mark', keywords: ['check', 'tick'] },
      { emoji: '❌', name: 'cross mark', keywords: ['cross', 'wrong', 'no'] },
      { emoji: '❎', name: 'cross mark button', keywords: ['cross', 'wrong'] },
      { emoji: '➕', name: 'plus sign', keywords: ['plus', 'add'] },
      { emoji: '➖', name: 'minus sign', keywords: ['minus', 'subtract'] },
      { emoji: '➗', name: 'division sign', keywords: ['divide'] },
      { emoji: '✖️', name: 'multiplication sign', keywords: ['multiply', 'times'] },
      { emoji: '♾️', name: 'infinity', keywords: ['infinity', 'forever'] },
      { emoji: '💲', name: 'heavy dollar sign', keywords: ['dollar', 'money'] },
      { emoji: '💱', name: 'currency exchange', keywords: ['currency', 'exchange'] },
      { emoji: '‼️', name: 'double exclamation mark', keywords: ['exclamation', 'warning'] },
      { emoji: '⁉️', name: 'exclamation question mark', keywords: ['exclamation', 'question'] },
      { emoji: '❓', name: 'question mark', keywords: ['question', '?'] },
      { emoji: '❔', name: 'white question mark', keywords: ['question'] },
      { emoji: '❕', name: 'white exclamation mark', keywords: ['exclamation'] },
      { emoji: '❗', name: 'exclamation mark', keywords: ['exclamation', '!'] },
      { emoji: '〰️', name: 'wavy dash', keywords: ['wavy', 'dash'] },
      { emoji: '🔚', name: 'end arrow', keywords: ['end'] },
      { emoji: '🔙', name: 'back arrow', keywords: ['back'] },
      { emoji: '🔛', name: 'on arrow', keywords: ['on'] },
      { emoji: '🔜', name: 'soon arrow', keywords: ['soon'] },
      { emoji: '🔝', name: 'top arrow', keywords: ['top', 'up'] },
      { emoji: '🆗', name: 'ok button', keywords: ['ok', 'okay'] },
      { emoji: '🆙', name: 'up button', keywords: ['up'] },
      { emoji: '🆕', name: 'new button', keywords: ['new'] },
      { emoji: '🆓', name: 'free button', keywords: ['free'] },
      { emoji: '🆒', name: 'cool button', keywords: ['cool'] },
      { emoji: '🆖', name: 'ng button', keywords: ['ng', 'no good'] },
      { emoji: '🅰️', name: 'a button blood type', keywords: ['blood type', 'a'] },
      { emoji: '🅱️', name: 'b button blood type', keywords: ['blood type', 'b'] },
      { emoji: '🆎', name: 'ab button blood type', keywords: ['blood type', 'ab'] },
      { emoji: '🆑', name: 'cl button', keywords: ['cl'] },
      { emoji: '🅾️', name: 'o button blood type', keywords: ['blood type', 'o'] },
      { emoji: '🆘', name: 'sos button', keywords: ['sos', 'emergency'] },
      { emoji: '🚫', name: 'prohibited', keywords: ['no', 'banned', 'prohibited'] },
      { emoji: '⛔', name: 'no entry', keywords: ['no entry', 'stop'] },
      { emoji: '📵', name: 'no mobile phones', keywords: ['no phone'] },
      { emoji: '🔞', name: 'no one under eighteen', keywords: ['adult', '18'] },
      { emoji: '🔕', name: 'bell with slash', keywords: ['mute', 'silent'] },
      { emoji: '🔔', name: 'bell', keywords: ['bell', 'notification'] },
      { emoji: '🔇', name: 'muted speaker', keywords: ['mute', 'silent'] },
      { emoji: '🔈', name: 'speaker low volume', keywords: ['speaker', 'volume'] },
      { emoji: '🔉', name: 'speaker medium volume', keywords: ['speaker', 'volume'] },
      { emoji: '🔊', name: 'speaker high volume', keywords: ['speaker', 'loud'] },
      { emoji: '📢', name: 'loudspeaker', keywords: ['loudspeaker', 'announce'] },
      { emoji: '📣', name: 'megaphone', keywords: ['megaphone', 'announce'] },
      { emoji: '🔔', name: 'bell', keywords: ['bell', 'alert'] },
      { emoji: '🎵', name: 'musical note', keywords: ['music', 'note'] },
      { emoji: '🎶', name: 'musical notes', keywords: ['music', 'notes'] },
      { emoji: '🎼', name: 'musical score', keywords: ['music', 'score'] },
      { emoji: '🏧', name: 'atm sign', keywords: ['atm', 'cash'] },
      { emoji: '🚾', name: 'water closet', keywords: ['wc', 'toilet'] },
      { emoji: '♿', name: 'wheelchair symbol', keywords: ['accessibility', 'wheelchair'] },
      { emoji: '🅿️', name: 'p button', keywords: ['parking', 'p'] },
      { emoji: '🚰', name: 'potable water', keywords: ['water', 'drink'] },
      { emoji: '🚹', name: "men's room", keywords: ['men', 'restroom'] },
      { emoji: '🚺', name: "women's room", keywords: ['women', 'restroom'] },
      { emoji: '🚻', name: 'restroom', keywords: ['restroom', 'bathroom'] },
      { emoji: '🚼', name: 'baby symbol', keywords: ['baby'] },
      { emoji: '🛗', name: 'elevator', keywords: ['elevator', 'lift'] },
      { emoji: '🚸', name: 'children crossing', keywords: ['children', 'crossing'] },
      { emoji: '⚠️', name: 'warning', keywords: ['warning', 'caution'] },
      { emoji: '🔣', name: 'input symbols', keywords: ['symbols'] },
      { emoji: '🔤', name: 'input latin letters', keywords: ['abc', 'letters'] },
      { emoji: '🔡', name: 'input latin lowercase', keywords: ['lowercase', 'letters'] },
      { emoji: '🔠', name: 'input latin uppercase', keywords: ['uppercase', 'letters'] },
      { emoji: '🆔', name: 'id button', keywords: ['id', 'identity'] },
      { emoji: '📶', name: 'antenna bars', keywords: ['signal', 'bars'] },
      { emoji: '🔻', name: 'red triangle pointed down', keywords: ['down', 'red'] },
      { emoji: '🔺', name: 'red triangle pointed up', keywords: ['up', 'red'] },
      { emoji: '💠', name: 'diamond with a dot', keywords: ['diamond', 'blue'] },
      { emoji: '🔷', name: 'large blue diamond', keywords: ['diamond', 'blue'] },
      { emoji: '🔶', name: 'large orange diamond', keywords: ['diamond', 'orange'] },
      { emoji: '🔹', name: 'small blue diamond', keywords: ['diamond', 'blue'] },
      { emoji: '🔸', name: 'small orange diamond', keywords: ['diamond', 'orange'] },
      { emoji: '▪️', name: 'black small square', keywords: ['square', 'black'] },
      { emoji: '▫️', name: 'white small square', keywords: ['square', 'white'] },
      { emoji: '◾', name: 'black medium-small square', keywords: ['square', 'black'] },
      { emoji: '◽', name: 'white medium-small square', keywords: ['square', 'white'] },
      { emoji: '◼️', name: 'black medium square', keywords: ['square', 'black'] },
      { emoji: '◻️', name: 'white medium square', keywords: ['square', 'white'] },
      { emoji: '⬛', name: 'black large square', keywords: ['square', 'black'] },
      { emoji: '⬜', name: 'white large square', keywords: ['square', 'white'] },
      { emoji: '🟥', name: 'red square', keywords: ['square', 'red'] },
      { emoji: '🟧', name: 'orange square', keywords: ['square', 'orange'] },
      { emoji: '🟨', name: 'yellow square', keywords: ['square', 'yellow'] },
      { emoji: '🟩', name: 'green square', keywords: ['square', 'green'] },
      { emoji: '🟦', name: 'blue square', keywords: ['square', 'blue'] },
      { emoji: '🟪', name: 'purple square', keywords: ['square', 'purple'] },
      { emoji: '🟫', name: 'brown square', keywords: ['square', 'brown'] },
      { emoji: '🔲', name: 'black square button', keywords: ['button', 'square'] },
      { emoji: '🔳', name: 'white square button', keywords: ['button', 'square'] },
      { emoji: '🔴', name: 'red circle', keywords: ['circle', 'red'] },
      { emoji: '🟠', name: 'orange circle', keywords: ['circle', 'orange'] },
      { emoji: '🟡', name: 'yellow circle', keywords: ['circle', 'yellow'] },
      { emoji: '🟢', name: 'green circle', keywords: ['circle', 'green'] },
      { emoji: '🔵', name: 'blue circle', keywords: ['circle', 'blue'] },
      { emoji: '🟣', name: 'purple circle', keywords: ['circle', 'purple'] },
      { emoji: '🟤', name: 'brown circle', keywords: ['circle', 'brown'] },
      { emoji: '⚫', name: 'black circle', keywords: ['circle', 'black'] },
      { emoji: '⚪', name: 'white circle', keywords: ['circle', 'white'] },
    ],
  },
]

const activeLabel = computed(
  () => categories.find(c => c.id === activeCategory.value)?.label ?? ''
)

const currentEmojis = computed(
  () => categories.find(c => c.id === activeCategory.value)?.emojis ?? []
)

const filteredEmojis = ref<EmojiEntry[]>([])

function onSearch() {
  if (!query.value.trim()) {
    filteredEmojis.value = []
    return
  }
  const q = query.value.toLowerCase()
  filteredEmojis.value = categories
    .flatMap(c => c.emojis)
    .filter(e =>
      e.name.includes(q) ||
      e.emoji.includes(q) ||
      e.keywords?.some(k => k.includes(q))
    )
    .slice(0, 80)
}

const displayedEmojis = computed(() =>
  query.value ? filteredEmojis.value : currentEmojis.value
)

function select(emoji: string) {
  emit('select', emoji)
}

// Close on outside click
function handleOutsideClick(e: MouseEvent) {
  if (pickerEl.value && !pickerEl.value.contains(e.target as Node)) {
    emit('close')
  }
}

onMounted(() => {
  nextTick(() => {
    searchEl.value?.focus()
    // Check if picker would overflow viewport bottom
    if (pickerEl.value) {
      const rect = pickerEl.value.getBoundingClientRect()
      if (rect.bottom > window.innerHeight - 16) {
        flipped.value = true
      }
    }
  })
  document.addEventListener('mousedown', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
})
</script>

<style scoped>
.emoji-picker {
  bottom: 100px;
  left: 450px;
  width: 320px;
  max-height: 360px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl, 0 20px 40px rgba(0, 0, 0, 0.4));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: pickerIn 120ms ease;
}

.emoji-grid-wrap {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-2);
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.emoji-picker.is-flipped {
  top: auto;
  bottom: calc(100% + 8px);
}

@keyframes pickerIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.emoji-search-wrap {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border-subtle);
}

.emoji-search {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text);
  font-size: var(--text-sm);
  font-family: var(--font-body);
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.emoji-search:focus {
  outline: none;
  border-color: var(--color-accent);
}

.emoji-tabs {
  display: flex;
  padding: var(--space-1) var(--space-2);
  gap: var(--space-1);
  border-bottom: 1px solid var(--color-border-subtle);
  scrollbar-width: none;
}

.emoji-tabs::-webkit-scrollbar {
  display: none;
}

.emoji-tab {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.1s;
  line-height: 1;
}

.emoji-tab:hover {
  background: var(--color-surface-2);
}

.emoji-tab.active {
  background: var(--color-accent-dim);
}

.emoji-tab:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

.emoji-grid-wrap {
  height: 220px;
  overflow-y: auto;
  padding: var(--space-2);
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
}

.emoji-btn {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.1s;
  line-height: 1;
  padding: 0;
}

.emoji-btn:hover {
  background: var(--color-surface-2);
}

.emoji-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}

.emoji-empty {
  font-size: var(--text-sm);
  color: var(--color-text-tertiary);
  text-align: center;
  padding: var(--space-6) 0;
  margin: 0;
  font-style: italic;
}
</style>