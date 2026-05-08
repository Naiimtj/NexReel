import PropTypes from 'prop-types';

const TMDB_LOGO_BASE = 'https://image.tmdb.org/t/p/original';

export function ProviderLogo({ provider }) {
  if (!provider?.logo_path) return null;
  return (
    <img
      className="inline-block h-5 md:h-7 w-auto rounded-lg md:rounded-lg px-0.5"
      src={`${TMDB_LOGO_BASE}/${provider.logo_path}`}
      alt={provider.provider_name}
    />
  );
}

ProviderLogo.propTypes = {
  provider: PropTypes.shape({
    logo_path: PropTypes.string,
    provider_name: PropTypes.string,
  }).isRequired,
};

function ProvidersSection({ label, providers }) {
  if (!providers || providers.length === 0) return null;
  return (
    <div className="md:text-right text-xs md:text-base text-gray-400">
      {label}
      <div className="pt-2">
        {providers.map((provider, index) => (
          <ProviderLogo
            key={`${provider.provider_id ?? provider.provider_name}-${index}`}
            provider={provider}
          />
        ))}
      </div>
    </div>
  );
}

ProvidersSection.propTypes = {
  label: PropTypes.string.isRequired,
  providers: PropTypes.array,
};

export default ProvidersSection;
