import { useI18n } from '../../lib/i18n';
import type { FacetGroup } from '../../lib/types';
import { Checkbox, Field, Input } from '../ui/form';
import { Chip } from '../ui/nav';
import { Button } from '../ui/primitives';

/** Filter state lives in the URL so listings stay shareable and bookmarkable. */
export type FilterState = {
  lists: Record<string, string[]>;
  priceMin: string;
  priceMax: string;
  sort: string;
};

export const emptyFilterState = (): FilterState => ({
  lists: {},
  priceMin: '',
  priceMax: '',
  sort: 'relevance',
});

const LIST_KEYS = [
  'brand',
  'category',
  'shape',
  'material',
  'gender',
  'color',
  'frame_size',
  'lens_color',
  'uv_protection',
  'availability',
  'prescription',
  'polarized',
  'lens_type',
  'lens_material',
  'refractive_index',
  'coating',
  'vision_type',
  'photochromic',
  'replacement_schedule',
  'pack_size',
];

export const readFilterState = (params: URLSearchParams): FilterState => {
  const state = emptyFilterState();
  for (const key of LIST_KEYS) {
    const raw = params.get(key);
    if (!raw) continue;
    const values = raw
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
    if (values.length) state.lists[key] = values;
  }
  state.priceMin = params.get('price_min') ?? '';
  state.priceMax = params.get('price_max') ?? '';
  state.sort = params.get('sort') ?? 'relevance';
  return state;
};

export const writeFilterState = (
  state: FilterState,
  extra: Record<string, string> = {},
): URLSearchParams => {
  const params = new URLSearchParams();
  for (const [key, values] of Object.entries(state.lists)) {
    if (values.length) params.set(key, values.join(','));
  }
  if (state.priceMin) params.set('price_min', state.priceMin);
  if (state.priceMax) params.set('price_max', state.priceMax);
  if (state.sort && state.sort !== 'relevance') params.set('sort', state.sort);
  for (const [key, value] of Object.entries(extra)) {
    if (value) params.set(key, value);
  }
  return params;
};

/** Query object handed to the API (lists joined, numbers parsed). */
export const toApiQuery = (state: FilterState, extra: Record<string, string> = {}) => {
  const query: Record<string, string | number> = { ...extra };
  for (const [key, values] of Object.entries(state.lists)) {
    if (values.length) query[key] = values.join(',');
  }
  if (state.priceMin) query.price_min = Number(state.priceMin);
  if (state.priceMax) query.price_max = Number(state.priceMax);
  query.sort = state.sort;
  return query;
};

export const activeFilterCount = (state: FilterState) =>
  Object.values(state.lists).reduce((total, values) => total + values.length, 0) +
  (state.priceMin ? 1 : 0) +
  (state.priceMax ? 1 : 0);

export const toggleOption = (state: FilterState, groupKey: string, value: string): FilterState => {
  const current = state.lists[groupKey] ?? [];
  const next = current.includes(value)
    ? current.filter((entry) => entry !== value)
    : [...current, value];
  const lists = { ...state.lists };
  if (next.length) lists[groupKey] = next;
  else delete lists[groupKey];
  return { ...state, lists };
};

const GROUP_LABEL_KEYS: Record<string, string> = {
  brand: 'filter.brand',
  category: 'filter.category',
  shape: 'filter.shape',
  material: 'filter.material',
  gender: 'filter.gender',
  color: 'filter.color',
  frame_size: 'filter.frame_size',
  lens_color: 'filter.lens_color',
  uv_protection: 'filter.uv_protection',
  availability: 'filter.availability',
  prescription: 'filter.prescription',
  polarized: 'filter.polarized',
  lens_type: 'filter.lens_type',
  lens_material: 'filter.lens_material',
  refractive_index: 'filter.refractive_index',
  coating: 'filter.coating',
  vision_type: 'filter.vision_type',
  photochromic: 'filter.photochromic',
  replacement_schedule: 'filter.replacement_schedule',
  pack_size: 'filter.pack_size',
  price: 'catalog.priceRange',
};

export const FilterPanel = ({
  groups,
  state,
  onToggle,
  onPriceChange,
  onApplyPrice,
  onClear,
}: {
  groups: FacetGroup[];
  state: FilterState;
  onToggle: (groupKey: string, value: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onApplyPrice: () => void;
  onClear: () => void;
}) => {
  const { t, tValue, locale } = useI18n();
  const count = activeFilterCount(state);

  const labelFor = (key: string) => {
    const messageKey = GROUP_LABEL_KEYS[key];
    return messageKey ? t(messageKey as never) : key;
  };

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <span className="text-[13px] uppercase tracking-label text-navy">
          {t('catalog.filtersTitle')}
          {count ? <span className="text-champagne-dark"> ({count})</span> : null}
        </span>
        {count ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[12px] uppercase tracking-label text-slate underline decoration-champagne decoration-2 underline-offset-4 transition-colors hover:text-navy"
          >
            {t('action.clearAll')}
          </button>
        ) : null}
      </div>

      {groups.map((group) => {
        if (group.type === 'range') {
          return (
            <fieldset key={group.key} className="border-t border-line pt-5">
              <legend className="text-[12px] uppercase tracking-label text-slate">
                {labelFor(group.key)}
              </legend>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Field label={t('common.from')}>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={state.priceMin}
                    placeholder={String(group.min)}
                    onChange={(event) => onPriceChange(event.target.value, state.priceMax)}
                  />
                </Field>
                <Field label={t('common.to')}>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={state.priceMax}
                    placeholder={String(group.max)}
                    onChange={(event) => onPriceChange(state.priceMin, event.target.value)}
                  />
                </Field>
              </div>
              <Button size="sm" variant="outline" className="mt-3" onClick={onApplyPrice}>
                {t('catalog.applyPrice')}
              </Button>
            </fieldset>
          );
        }

        const selected = state.lists[group.key] ?? [];

        return (
          <fieldset key={group.key} className="border-t border-line pt-5">
            <legend className="text-[12px] uppercase tracking-label text-slate">
              {labelFor(group.key)}
            </legend>
            <div className="mt-3">
              {group.options.map((option) => {
                const label =
                  locale === 'fa' && option.labelFa ? option.labelFa : tValue(option.label);
                return (
                  <Checkbox
                    key={option.value}
                    name={`${group.key}-${option.value}`}
                    label={label}
                    count={option.count}
                    checked={selected.includes(option.value)}
                    onChange={() => onToggle(group.key, option.value)}
                  />
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
};

export const ActiveFilters = ({
  groups,
  state,
  onToggle,
  onClear,
}: {
  groups: FacetGroup[];
  state: FilterState;
  onToggle: (groupKey: string, value: string) => void;
  onClear: () => void;
}) => {
  const { t, tValue, locale } = useI18n();
  const chips: Array<{ key: string; value: string; label: string }> = [];

  for (const [groupKey, values] of Object.entries(state.lists)) {
    const group = groups.find((entry) => entry.key === groupKey);
    for (const value of values) {
      const option =
        group && group.type === 'list'
          ? group.options.find((entry) => entry.value === value)
          : undefined;
      const label =
        option && locale === 'fa' && option.labelFa
          ? option.labelFa
          : option
            ? tValue(option.label)
            : tValue(value);
      chips.push({ key: groupKey, value, label });
    }
  }

  if (state.priceMin || state.priceMax) {
    chips.push({
      key: 'price',
      value: '',
      label: `${t('catalog.priceRange')}: ${state.priceMin || '0'} — ${state.priceMax || '∞'}`,
    });
  }

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[12px] uppercase tracking-label text-slate">
        {t('catalog.activeFilters')}:
      </span>
      {chips.map((chip) => (
        <Chip
          key={`${chip.key}-${chip.value}`}
          label={chip.label}
          removeLabel={t('action.remove')}
          onRemove={() => {
            if (chip.key === 'price') return onClear();
            onToggle(chip.key, chip.value);
          }}
        />
      ))}
      <button
        type="button"
        onClick={onClear}
        className="text-[12px] uppercase tracking-label text-slate underline decoration-champagne decoration-2 underline-offset-4 transition-colors hover:text-navy"
      >
        {t('action.clearAll')}
      </button>
    </div>
  );
};

export const SortSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useI18n();
  const options = [
    { value: 'relevance', label: t('catalog.sortRelevance') },
    { value: 'newest', label: t('catalog.sortNewest') },
    { value: 'price-asc', label: t('catalog.sortPriceAsc') },
    { value: 'price-desc', label: t('catalog.sortPriceDesc') },
    { value: 'name', label: t('catalog.sortName') },
  ];
  return (
    <label className="flex items-center gap-3 text-[12px] uppercase tracking-label text-slate">
      {t('catalog.sortBy')}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border border-line bg-paper px-3 py-2 text-[13px] normal-case tracking-normal text-navy transition-colors hover:border-line-strong focus:border-navy focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};
