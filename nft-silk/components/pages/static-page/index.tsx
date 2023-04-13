import clsx from 'clsx';
import { string } from 'yup';

export type StaticPageProps = {
  children: any;
  backgroundVideo?: string;
  backgroundFallback?: string;
  backgroundImage?: string;
  className?: string;
};

export const StaticPage = ({
  children,
  backgroundVideo,
  backgroundFallback,
  backgroundImage,
  className,
}: StaticPageProps) => {
  return (
    <>
      <div className="text-white">
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
            <div className="text-center flex gap-8 flex-col items-center relative bg-blue-900 bg-opacity-50 backdrop-blur rounded-md px-4 pt-5 pb-4 overflow-hidden transform sm:my-8 sm:max-w-2xl sm:w-full md:p-12">
              {children}
            </div>
          </div>
        </div>
      </div>

      <div className="-z-10 fixed inset-0 bg-blue-900 bg-opacity-75"></div>
      {!backgroundVideo ? (
        <div className="h-screen flex items-end">
          <img src={backgroundImage} alt="" className={clsx(className ? className : 'mx-auto max-w-full h-[90%]')} />
        </div>
      ) : (
        <video
          autoPlay
          muted
          loop
          className="-z-20 bgVideo"
          style={{
            backgroundImage:
              backgroundFallback || backgroundImage ? `url(${backgroundFallback || backgroundImage})` : null,
          }}
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      )}
    </>
  );
};
