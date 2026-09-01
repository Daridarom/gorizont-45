import { ArrowDown, MapPin } from "lucide-react";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Горизонт 45 — к началу страницы">
          <img src="/images/logo.png" alt="" />
          <span>
            ГОРИЗОНТ <b>45</b>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Основная навигация">
          <a href="#concept">Концепция</a>
          <a href="#overview">3D-обзор</a>
          <a href="#spaces">Пространства</a>
          <a href="#program">Сообщество</a>
        </nav>
        <a className="header-action" href="#overview">
          Исследовать
        </a>
      </header>

      <section className="hero" id="top">
        <img className="hero-image" src="/images/hero.webp" alt="Бухта Космонавтов" />
        <div className="hero-wash" />
        <div className="hero-content page-width">
          <div className="hero-copy">
            <p className="eyebrow light">
              <MapPin aria-hidden="true" />
              45.394202° N · 36.627198° E
            </p>
            <h1>
              ГОРИЗОНТ <span>45</span>
            </h1>
            <p className="hero-subtitle">Ландшафтный комплекс у Бухты Космонавтов</p>
            <p className="hero-lead">
              Гостеприимство, восстановление и события — в ритме ландшафта.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#overview">
                Исследовать территорию
                <ArrowDown aria-hidden="true" />
              </a>
              <a className="text-link" href="#concept">
                Принцип проекта
              </a>
            </div>
          </div>
          <p className="hero-note">Керченский полуостров · Республика Крым</p>
        </div>
      </section>

      <section className="concept-section" id="concept">
        <div className="page-width concept-grid">
          <div>
            <p className="eyebrow">01 · Принцип проекта</p>
            <h2>
              Архитектура следует рельефу.
              <br />
              <span>Берег сохраняет свой характер.</span>
            </h2>
          </div>
          <div className="concept-copy">
            <p>
              Планировка начинается с рельефа, видовых коридоров и естественных
              маршрутов. Гостевые дома собраны на внутреннем склоне, а берег
              остаётся пространством движения, воздуха и открытого горизонта.
            </p>
            <div className="metric-row" aria-label="Параметры проекта">
              <div><strong>2,4</strong><span>га территории</span></div>
              <div><strong>30</strong><span>гостевых домов</span></div>
              <div><strong>200</strong><span>м² кафе</span></div>
              <div><strong>II / 2029</strong><span>целевой ввод</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="overview-section" id="overview">
        <div className="page-width overview-heading">
          <div>
            <p className="eyebrow light">02 · Панорамный 3D-тур</p>
            <h2>Пространство можно исследовать изнутри</h2>
          </div>
          <p>
            Поворачивайте панораму, приближайте детали и переходите между
            точками обзора. Тур загружается напрямую из действующей 3D-сцены
            проекта «Азгард».
          </p>
        </div>
        <div className="tour-embed page-width">
          <div className="tour-frame">
            <iframe
              src="https://azgard-crimea.ru/"
              title="Панорамный 3D-тур по проекту Азгард"
              loading="lazy"
              allow="fullscreen; accelerometer; gyroscope"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <span className="tour-badge">3D · 360°</span>
          </div>
          <div className="tour-meta">
            <div>
              <strong>Управление обзором</strong>
              <span>Проведите пальцем или удерживайте курсор. Используйте жест приближения.</span>
            </div>
            <a href="https://azgard-crimea.ru/" target="_blank" rel="noreferrer">
              Открыть на весь экран ↗
            </a>
          </div>
        </div>
      </section>

      <section className="architecture-section" id="architecture">
        <div className="page-width architecture-heading">
          <div>
            <p className="eyebrow">03 · Архитектурный код</p>
            <h2>Низкий силуэт сохраняет горизонт</h2>
          </div>
          <p>
            Одноэтажные объёмы не доминируют над местом. Зелёные кровли,
            природный камень, тёплое дерево и панорамное остекление продолжают
            язык склона.
          </p>
        </div>

        <div className="architecture-gallery page-width">
          <figure className="architecture-main">
            <img
              src="/images/houses.webp"
              alt="Гостевые дома, встроенные во внутренний склон"
              loading="lazy"
            />
            <figcaption>Три террасированные группы · 30 домов по 30 м²</figcaption>
          </figure>
          <figure className="architecture-side">
            <img
              src="/images/interior.webp"
              alt="Интерьер гостевого дома с панорамным видом на море"
              loading="lazy"
            />
            <figcaption>Ландшафт становится главным интерьером</figcaption>
          </figure>
        </div>

        <div className="architecture-points page-width">
          <div><span>01</span><strong>Зелёные кровли</strong><p>Продолжают растительный покров и снижают визуальное присутствие.</p></div>
          <div><span>02</span><strong>Природные материалы</strong><p>Камень и дерево создают спокойную, тактильную среду.</p></div>
          <div><span>03</span><strong>Панорамный свет</strong><p>Остекление раскрывает море, не превращая дом в витрину.</p></div>
          <div><span>04</span><strong>Минимум земляных работ</strong><p>Посадка домов следует естественной пластике склона.</p></div>
        </div>
      </section>

      <section className="spaces-section" id="spaces">
        <div className="page-width spaces-heading">
          <p className="eyebrow">04 · Пространства</p>
          <h2>Гостевой ритм соединяется с восстановлением и встречами</h2>
        </div>

        <div className="page-width space-stories">
          <article className="space-story">
            <div className="space-image">
              <img
                src="/images/cafe.webp"
                alt="Панорамное кафе на восточном гребне"
                loading="lazy"
              />
              <span>01 · Гребень</span>
            </div>
            <div className="space-copy">
              <p className="space-kicker">Панорамное кафе</p>
              <h3>Остановка на маршруте. Встреча с горизонтом.</h3>
              <p>
                Днём — спокойная видовая точка. Вечером — ужины, лекции и
                камерные встречи. Архитектура повторяет линию рельефа и не
                перекрывает пространство вокруг.
              </p>
            </div>
          </article>

          <article className="space-story is-reversed">
            <div className="space-image">
              <img
                src="/images/spa.webp"
                alt="SPA-зона с видом на море"
                loading="lazy"
              />
              <span>02 · Северный склон</span>
            </div>
            <div className="space-copy">
              <p className="space-kicker">SPA / восстановление</p>
              <h3>Тишина, тепло и море — без лишнего визуального шума.</h3>
              <p>
                Камерный формат объединяет воду, локальный камень и защищённый
                свет. Это пространство восстановления, где главным событием
                остаётся сам ландшафт.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="route-section" id="routes">
        <div className="route-visual">
          <img
            src="/images/routes.webp"
            alt="Природная дорога к берегу Бухты Космонавтов"
            loading="lazy"
          />
        </div>
        <div className="route-copy">
          <p className="eyebrow">05 · Пространственный договор</p>
          <h2>Доступ к берегу заложен в планировке</h2>
          <p className="route-lead">
            Маршрут раскрывает место постепенно: через природные петли, тихие
            точки наблюдения и открытые пространства у моря.
          </p>
          <ol>
            <li><span>01</span>Непрерывный проход вдоль берега</li>
            <li><span>02</span>Прибрежная полоса — без гостевых домов</li>
            <li><span>03</span>Уход, навигация и понятные правила</li>
            <li><span>04</span>Открытые события и природные маршруты</li>
          </ol>
        </div>
      </section>

      <section className="program-section" id="program">
        <img
          className="program-image"
          src="/images/events.webp"
          alt="Событие в природном амфитеатре"
          loading="lazy"
        />
        <div className="program-overlay" />
        <div className="page-width program-content">
          <p className="eyebrow light">06 · Живая программа</p>
          <h2>Сообщество создаёт культуру места</h2>
          <p className="program-lead">
            Амфитеатр, павильон и открытая поляна принимают лекции, концерты,
            кино, практики и встречи. Событийная история поддерживает жизнь
            комплекса за пределами обычного курортного сценария.
          </p>
          <div className="program-grid">
            <div><span>Семьи и дети</span><p>Семейные и образовательные программы.</p></div>
            <div><span>Восстановление</span><p>Программы для участников СВО и их семей.</p></div>
            <div><span>Местные жители</span><p>Маршруты, события и совместные инициативы.</p></div>
            <div><span>Местный бизнес</span><p>Поставщики, продукты, сервис и занятость.</p></div>
          </div>
        </div>
      </section>

      <section className="closing-section">
        <img
          className="closing-image"
          src="/images/sunset.webp"
          alt="Закат в прибрежном гроте"
          loading="lazy"
        />
        <div className="closing-overlay" />
        <div className="page-width closing-content">
          <img src="/images/logo.png" alt="" />
          <p className="eyebrow light">Горизонт 45</p>
          <h2>Место, где природа, культура и гостеприимство усиливают друг друга</h2>
          <a href="#top">Вернуться к началу ↑</a>
        </div>
        <footer className="page-width site-footer">
          <p>Инициатор проекта: ООО «СЗ „АЗГАРД“»</p>
          <p>Республика Крым, г. Керчь, ул. Театральная, д. 37</p>
          <p>Концептуальные решения уточняются после ДПТ, изысканий и проектирования.</p>
        </footer>
      </section>

      <nav className="mobile-dock" aria-label="Мобильная навигация">
        <a href="#top">Начало</a>
        <a href="#spaces">Места</a>
        <a href="#overview">3D-обзор</a>
      </nav>
    </main>
  );
}
